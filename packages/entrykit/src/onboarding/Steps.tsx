import { Children, Fragment, JSXElementConstructor, ReactElement, ReactNode, isValidElement } from "react";
import { Step, Props as StepProps } from "./Step";
import { TabsContent, TabsList, Root as TabsRoot, TabsTrigger } from "@radix-ui/react-tabs";
import { twMerge } from "tailwind-merge";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isElement<type extends string | JSXElementConstructor<any>>(
  element: unknown,
  type: type,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): element is ReactElement<any, type> {
  return isValidElement(element) && element.type === type;
}

export type Props = {
  children: ReactNode;
};

export function Steps({ children }: Props) {
  function mapSteps(children: ReactNode, transform: (child: StepProps) => ReactNode) {
    return Children.map(
      children,
      (child): ReactNode =>
        isElement(child, Step) ? (
          transform(child.props)
        ) : isElement(child, Fragment) ? (
          child.props.children ? (
            <>{mapSteps(child.props.children, transform)}</>
          ) : null
        ) : null,
    );
  }

  return (
    <TabsRoot defaultValue="connectWallet" className="flex-grow flex flex-col">
      <TabsList className="flex items-center justify-center p-2">
        {mapSteps(children, (step) => (
          <TabsTrigger
            value={step.id}
            title={step.label}
            className="outline-none p-2.5 -my-2.5 hover:enabled:brightness-125 transition"
          >
            <span
              className={twMerge(
                "block w-2.5 h-2.5 rounded-full bg-orange-500",
                // step.id === activeStep ? "ring-4 ring-orange-500/20" : null,
                // step.id === nextStep?.id ? "bg-orange-500" : step.isComplete ? "bg-amber-700" : "bg-gray-300",
              )}
            ></span>
            <span className="sr-only">{step.label}</span>
          </TabsTrigger>
        ))}
      </TabsList>
      {mapSteps(children, (step) => (
        <TabsContent value={step.id} className="outline-none flex-grow flex flex-col">
          {step.children}
        </TabsContent>
      ))}
    </TabsRoot>
  );
}
