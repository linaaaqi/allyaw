import { IHandler } from './IHandler'
import { MarkdownMessageHandler } from './MarkdownMessageHandler.js'
import { SimpleTemplateMessageHandler } from './SimpleTemplateMessageHandler.js'
import { TemplateMessageHandler } from './TemplateMessageHandler.js'

export class HandlerFactory {
  get factory (): IHandler {
    return this._factory
  }

  set factory (value: IHandler) {
    this._factory = value
  }
  private _factory: IHandler

  constructor (private readonly type?: string) {
    switch (type) {
      case 'template':
        this._factory = new TemplateMessageHandler()
        break

      case 'simple':
        this._factory = new SimpleTemplateMessageHandler()
        break

      default:
        this._factory = new MarkdownMessageHandler()
    }
  }
}
