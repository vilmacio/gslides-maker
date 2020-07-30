interface payload {
    email:string;
}
export function decode(token: string): payload | { [key: string]: any };
export function decode(token: string): payload | { [key: string]: any };
