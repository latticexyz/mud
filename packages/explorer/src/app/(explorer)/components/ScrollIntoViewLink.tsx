type Props = {
  elementId: string;
  children: React.ReactNode;
  className?: string;
} & React.AnchorHTMLAttributes<HTMLAnchorElement>;

export function ScrollIntoViewLink({ elementId, children, ...rest }: Props) {
  return (
    <a
      href={`#${elementId}`}
      onClick={(evt) => {
        evt.preventDefault();
        document.getElementById(elementId)?.scrollIntoView({ behavior: "smooth" });
      }}
      {...rest}
    >
      {children}
    </a>
  );
}
