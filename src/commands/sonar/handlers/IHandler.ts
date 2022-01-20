export interface IHandler {
  handle (res, alert?: boolean): Promise<any> | undefined;

  fetch (id: string): Promise<any> | undefined;
}
