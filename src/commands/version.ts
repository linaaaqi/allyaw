import type { Arguments, CommandBuilder } from 'yargs';
import { version } from '../../package.json'

type Options = {
  name: string;
  upper: boolean | undefined;
};

export const command: string = 'version';
export const desc: string = '获取当前Magic CLI版本';

export const builder: CommandBuilder<Options, Options> = (yargs) =>
  yargs
    .options({
      upper: { type: 'boolean' },
    })
    .positional('name', { type: 'string', demandOption: true });

export const handler = (argv: Arguments<Options>): void => {
  const { name, upper } = argv;
  const greeting = `当前Magic CLI版本: v${version}, ${name}`;

  process.stdout.write(upper ? greeting.toUpperCase() : greeting);
  process.exit(0);
}
