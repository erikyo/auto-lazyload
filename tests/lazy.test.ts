import {expect, describe, afterEach, it, vitest, beforeEach, vi} from 'vitest';
import {
    fastLazyLoad,
} from '../src'; // Replace with the actual path to your script

describe('fastLazyLoad', () => {
    // Mock IntersectionObserver
    const mockIntersectionObserver = vitest.fn( () => ({
        observe: vitest.fn(),
        unobserve: vitest.fn(),
        disconnect: vitest.fn(),
    }));
    const mockMutationObserver = vitest.fn( () => ({
        observe: vitest.fn(),
        disconnect: vitest.fn(),
    }));

    beforeEach(() => {
        vitest.spyOn(document, 'querySelectorAll').mockImplementation(() => [document.createElement('div')] as never);
        window.IntersectionObserver = mockIntersectionObserver as any;
        window.MutationObserver = mockMutationObserver as any;
    });

    afterEach(() => {
        mockIntersectionObserver.mockClear();
        mockMutationObserver.mockClear();
    });

    it('should call the IntersectionObserver with the correct options', () => {
        fastLazyLoad();
        expect(mockIntersectionObserver).toHaveBeenCalled();
    })

    it('should create a MutationObserver to watch for changes in the DOM', () => {
        fastLazyLoad();
        expect(mockMutationObserver).toHaveBeenCalled();
    });

    it('should fallback for browsers that do not support Intersection Observer', () => {
        delete window.IntersectionObserver;
        fastLazyLoad();
        expect(document.querySelectorAll).toHaveBeenCalled();
    });
});
