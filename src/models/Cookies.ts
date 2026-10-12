import * as ck from "universal-cookie";

export class Cookies {
  private static instance: Cookies;
  private cookies: ck.default;

  private constructor() {
    this.cookies = new ck.default();
  }

  public getCookies<T>(name: string) {
    return this.cookies.get(name) as T;
  }

  public setCookies<T>(name: string, val: T) {
    const date = new Date();
    date.setTime(date.getTime() + 7 * 24 * 60 * 60 * 1000);
    this.cookies.set(name, val, { path: "/", expires: date });
  }

  public removeCookies(name: string) {
    this.cookies.remove(name);
  }

  public static getInstance() {
    if (!this.instance) this.instance = new Cookies();
    return this.instance;
  }
}
