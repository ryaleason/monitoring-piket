import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { copyToClipboard } from "@/lib/clipboard";

describe("copyToClipboard", () => {
  const originalNavigator = global.navigator;
  const originalDocument = global.document;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    Object.defineProperty(global, "navigator", {
      value: originalNavigator,
      writable: true,
    });
    Object.defineProperty(global, "document", {
      value: originalDocument,
      writable: true,
    });
  });

  it("uses navigator.clipboard.writeText when available and successful", async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(global, "navigator", {
      value: {
        clipboard: {
          writeText: writeTextMock,
        },
      },
      writable: true,
    });

    const result = await copyToClipboard("Test Report");
    expect(result).toBe(true);
    expect(writeTextMock).toHaveBeenCalledWith("Test Report");
  });

  it("falls back to document.execCommand when navigator.clipboard is unavailable (Review Focus 4)", async () => {
    Object.defineProperty(global, "navigator", {
      value: {},
      writable: true,
    });

    const execCommandMock = vi.fn().mockReturnValue(true);
    const appendChildMock = vi.fn();
    const removeChildMock = vi.fn();

    const mockTextArea = {
      value: "",
      style: {},
      focus: vi.fn(),
      select: vi.fn(),
      setSelectionRange: vi.fn(),
    };

    Object.defineProperty(global, "document", {
      value: {
        createElement: vi.fn().mockReturnValue(mockTextArea),
        body: {
          appendChild: appendChildMock,
          removeChild: removeChildMock,
        },
        execCommand: execCommandMock,
      },
      writable: true,
    });

    const result = await copyToClipboard("Fallback text");
    expect(result).toBe(true);
    expect(mockTextArea.value).toBe("Fallback text");
    expect(execCommandMock).toHaveBeenCalledWith("copy");
    expect(removeChildMock).toHaveBeenCalled();
  });

  it("falls back to document.execCommand when navigator.clipboard.writeText rejects", async () => {
    const writeTextMock = vi.fn().mockRejectedValue(new Error("Permission denied"));
    Object.defineProperty(global, "navigator", {
      value: {
        clipboard: {
          writeText: writeTextMock,
        },
      },
      writable: true,
    });

    const execCommandMock = vi.fn().mockReturnValue(true);
    const mockTextArea = {
      value: "",
      style: {},
      focus: vi.fn(),
      select: vi.fn(),
      setSelectionRange: vi.fn(),
    };

    Object.defineProperty(global, "document", {
      value: {
        createElement: vi.fn().mockReturnValue(mockTextArea),
        body: {
          appendChild: vi.fn(),
          removeChild: vi.fn(),
        },
        execCommand: execCommandMock,
      },
      writable: true,
    });

    const result = await copyToClipboard("Fallback text 2");
    expect(result).toBe(true);
    expect(execCommandMock).toHaveBeenCalledWith("copy");
  });
});
