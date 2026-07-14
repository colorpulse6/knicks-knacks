import { isValidElement, type CSSProperties, type ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { imageResponseSpy } = vi.hoisted(() => ({
  imageResponseSpy: vi.fn(),
}));

vi.mock("next/og", () => ({
  ImageResponse: function MockImageResponse(...args: unknown[]) {
    imageResponseSpy(...args);
  },
}));

import OpenGraphImage from "./opengraph-image";

interface ElementProps {
  readonly children?: ReactNode;
  readonly style?: CSSProperties;
}

function elementsIn(node: ReactNode): React.ReactElement<ElementProps>[] {
  if (Array.isArray(node)) {
    return node.flatMap(elementsIn);
  }

  if (!isValidElement<ElementProps>(node)) {
    return [];
  }

  return [node, ...elementsIn(node.props.children)];
}

function textIn(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }

  if (Array.isArray(node)) {
    return node.map(textIn).join("");
  }

  return isValidElement<ElementProps>(node) ? textIn(node.props.children) : "";
}

describe("OpenGraphImage", () => {
  beforeEach(() => {
    imageResponseSpy.mockClear();
  });

  it("renders terminal lights as local CSS circles instead of font glyphs", () => {
    OpenGraphImage();

    expect(imageResponseSpy).toHaveBeenCalledOnce();
    const imageNode = imageResponseSpy.mock.calls[0][0] as ReactNode;
    expect(textIn(imageNode)).not.toContain("●");

    const lights = elementsIn(imageNode).filter(
      (element) =>
        element.type === "span" && element.props.children === undefined,
    );

    expect(lights.map(({ props }) => props.style)).toEqual([
      {
        width: "12px",
        height: "12px",
        background: "#b8ff3d",
        borderRadius: "50%",
        flexShrink: 0,
      },
      {
        width: "12px",
        height: "12px",
        background: "#5ee7f5",
        borderRadius: "50%",
        flexShrink: 0,
      },
    ]);
  });
});
