import { IconSVG, Props } from "./IconSVG";

// TODO: simplify to solid path instead of pixels

export function Logo(props: Props) {
  return (
    <IconSVG viewBox="0 0 45 40" {...props}>
      <path
        // eslint-disable-next-line max-len
        d="M5 0H0v5h5V0ZM5 5H0v5h5V5ZM5 10H0v5h5v-5ZM5 15H0v5h5v-5ZM5 20H0v5h5v-5ZM5 25H0v5h5v-5ZM5 30H0v5h5v-5ZM5 35H0v5h5v-5ZM10 35H5v5h5v-5ZM15 35h-5v5h5v-5ZM20 35h-5v5h5v-5ZM25 35h-5v5h5v-5ZM30 35h-5v5h5v-5ZM40 30h-5v5h5v-5ZM40 35h-5v5h5v-5ZM35 35h-5v5h5v-5ZM40 5h-5v5h5V5ZM10 0H5v5h5V0ZM15 0h-5v5h5V0ZM20 0h-5v5h5V0ZM25 0h-5v5h5V0ZM30 0h-5v5h5V0ZM35 0h-5v5h5V0ZM40 0h-5v5h5V0Z"
        fill="#000"
      />
      <path
        // eslint-disable-next-line max-len
        d="M30 10h-5v5h5v-5ZM30 15h-5v5h5v-5ZM30 20h-5v5h5v-5ZM30 25h-5v5h5v-5ZM35 10h-5v5h5v-5ZM35 25h-5v5h5v-5ZM45 10h-5v5h5v-5ZM45 15h-5v5h5v-5ZM45 20h-5v5h5v-5ZM45 25h-5v5h5v-5ZM40 10h-5v5h5v-5ZM40 25h-5v5h5v-5Z"
      />
    </IconSVG>
  );
}
