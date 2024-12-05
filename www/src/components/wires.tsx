import type { SVGProps } from "react";

export default function Wires(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={900}
      height={900}
      viewBox="107 100 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      strokeWidth={16}
      strokeOpacity={0.25}
      {...props}
    >
      <path
        d="m123 269 24-10.246q9.815-19.038 14.684-29.811T171 205.651l24 11.393 23.289-41.126L243 212.189l25.116-31.415L291 125"
        stroke="#000"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
