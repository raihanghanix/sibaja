import Cookies from "universal-cookie";

const cookies = new Cookies();

export function getCookies<T>(name: string) {
  return cookies.get(name) as T;
}

export function setCookies<T>(name: string, val: T) {
  const date = new Date();
  date.setTime(date.getTime() + 7 * 24 * 60 * 60 * 1000);
  cookies.set(name, val, { path: "/", expires: date });
}

export function removeCookies(name: string) {
  cookies.remove(name);
}
