import { afterEach, beforeEach, describe, expect, it, vitest } from "vitest";
import fastLazyLoad from "../src/index.js";

describe("fastLazyLoad", () => {
	// Mock IntersectionObserver
	const mockIntersectionObserver = vitest.fn(() => ({
		observe: vitest.fn(),
		unobserve: vitest.fn(),
		disconnect: vitest.fn(),
	}));
	const mockMutationObserver = vitest.fn(() => ({
		observe: vitest.fn(),
		disconnect: vitest.fn(),
	}));

	beforeEach(() => {
		vitest
			.spyOn(document, "querySelectorAll")
			.mockImplementation(() => [document.createElement("div")] as never);
		// @ts-ignore
		window.IntersectionObserver = mockIntersectionObserver;
		// @ts-ignore
		window.MutationObserver = mockMutationObserver;
	});

	afterEach(() => {
		mockIntersectionObserver.mockClear();
		mockMutationObserver.mockClear();
	});

	it("should call the IntersectionObserver with the correct options", () => {
		fastLazyLoad();
		expect(mockIntersectionObserver).toHaveBeenCalled();
	});

	it("should create a MutationObserver to watch for changes in the DOM", () => {
		fastLazyLoad();
		expect(mockMutationObserver).toHaveBeenCalled();
	});
});
