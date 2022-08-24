import {
  BaseGenerator,
  execa,
  fsExtra,
  getGitInfo,
  installWithNpmClient,
  logger,
  NpmClient,
  pkgUp,
  prompts,
  tryPaths,
  yParser
} from '@umijs/utils';
import { checkVersion, setNoDeprecation, setNodeTitle } from 'father/dist/cli/node'
import { existsSync } from 'fs';
import { dirname, join } from 'path';

export interface IOptions extends yParser.Arguments {
  git?: boolean;
  install?: boolean;
}

interface IContext {
  projectRoot: string;
  inMonorepo: boolean;
  target: string;
}

interface ITemplateParams {
  version: string;
  npmClient: NpmClient;
  registry: string;
  author: string;
  withHusky: boolean;
  extraNpmrc: string;
}

export default async ({ cwd, args }: { cwd: string; args: IOptions }) => {
  checkVersion()
  setNodeTitle();
  setNoDeprecation()

  const [type, name] = args._;
  let templateChoices: { title: string; value: string }[];
  let pluginPrompts: prompts.PromptObject[];

  switch (type) {
    case 'app':
      templateChoices = [
        { title: 'React Simple App', value: 'react-app' }
      ]
      pluginPrompts = []

      // TODO: add more template choices
      throw new Error('Create app templates still not implemented');
    case 'lib':
    default:
      templateChoices = [
        { title: 'Simple Library', value: 'simple-lib' },
        { title: 'Monorepo Library', value: 'monorepo-lib' },
        { title: 'Monorepo Child Library', value: 'monorepo-child-lib' }
      ]
      pluginPrompts = [
        {
          name: 'name',
          type: 'text',
          message: `What's the plugin name?`,
          default: name
        },
        {
          name: 'description',
          type: 'text',
          message: `What's your plugin used for?`
        }
      ] as prompts.PromptObject[];
      break
  }

  let npmClient: NpmClient;
  let registry: string;
  let templateName: string;
  const { username, email } = await getGitInfo();
  let author = email && username ? `${ username } <${ email }>` : '';

  const response = await prompts(
    [
      {
        type: 'select',
        name: 'templateName',
        message: 'Pick a template',
        choices: templateChoices,
        initial: 0
      },
      {
        type: 'select',
        name: 'npmClient',
        message: 'Pick a npm client',
        choices: [
          { title: 'npm', value: 'npm' },
          { title: 'yarn', value: 'yarn' },
          { title: 'pnpm', value: 'pnpm' }
        ],
        initial: 2
      },
      {
        type: 'select',
        name: 'registry',
        message: 'Pick a npm registry',
        choices: [
          {
            title: 'npm',
            value: 'https://registry.npmjs.org/',
            selected: true
          },
          { title: 'taobao', value: 'https://registry.npmmirror.com' }
        ],
        initial: 1
      }
    ],
    {
      onCancel () {
        process.exit(1);
      }
    }
  );
  npmClient = response.npmClient;
  registry = response.registry;
  templateName = response.templateName;

  const target = name ? join(cwd, name) : cwd;

  const version = require('../package.json').version;

  // detect monorepo
  const monorepoRoot = await detectMonorepoRoot({ target });
  const inMonorepo = !!monorepoRoot;
  const projectRoot = inMonorepo ? monorepoRoot : target;

  // git
  const shouldInitGit = args.git !== false;
  // now husky is not supported in monorepo
  const withHusky = shouldInitGit && !inMonorepo;

  const generator = new BaseGenerator({
    path: join(__dirname, '..', 'templates', templateName),
    target,
    data: {
      version: version.includes('-canary.') ? version : `^${ version }`,
      npmClient,
      templateName,
      registry,
      author,
      withHusky,
      // suppress pnpm v7 warning
      extraNpmrc:
        npmClient === 'pnpm' ? `strict-peer-dependencies=false` : ''
    } as ITemplateParams,
    questions: pluginPrompts
  });
  await generator.run();

  const context: IContext = {
    inMonorepo,
    target,
    projectRoot
  };

  if (!withHusky) {
    await removeHusky(context);
  }

  if (inMonorepo) {
    // monorepo should move .npmrc to root
    await moveNpmrc(context);
  }

  // init git
  if (shouldInitGit) {
    await initGit(context);
  } else {
    logger.info(`Skip Git init`);
  }

  // install deps
  if (args.install !== false) {
    installWithNpmClient({ npmClient, cwd: target });
  } else {
    logger.info(`Skip install deps`);
  }
};

async function detectMonorepoRoot (opts: {
  target: string;
}): Promise<string | null> {
  const { target } = opts;
  const rootPkg = await pkgUp.pkgUp({ cwd: dirname(target) });
  if (!rootPkg) {
    return null;
  }
  const rootDir = dirname(rootPkg);
  if (
    tryPaths([
      join(rootDir, 'lerna.json'),
      join(rootDir, 'pnpm-workspace.yaml')
    ])
  ) {
    return rootDir;
  }
  return null;
}

async function moveNpmrc (opts: IContext) {
  const { target, projectRoot } = opts;
  const sourceNpmrc = join(target, './.npmrc');
  const targetNpmrc = join(projectRoot, './.npmrc');
  if (!existsSync(targetNpmrc)) {
    await fsExtra.copyFile(sourceNpmrc, targetNpmrc);
  }
  await fsExtra.remove(sourceNpmrc);
}

async function initGit (opts: IContext) {
  const { projectRoot } = opts;
  const isGit = existsSync(join(projectRoot, '.git'));
  if (isGit) return;
  try {
    await execa.execa('git', ['init'], { cwd: projectRoot });
    logger.ready(`Git initialized successfully`);
  } catch {
    logger.error(`Initial the git repo failed`);
  }
}

async function removeHusky (opts: IContext) {
  const dir = join(opts.target, './.husky');
  if (existsSync(dir)) {
    await fsExtra.remove(dir);
  }
}
