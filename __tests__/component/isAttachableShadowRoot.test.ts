import "jest";
import { isAttachableShadowRoot } from '../../src/component/isAttachableShadowRoot';

describe('isAttachableShadowRoot', () => {
  test('should return true for custom elements', () => {
    expect(isAttachableShadowRoot('my-custom-element')).toBe(true);
    expect(isAttachableShadowRoot('another-custom-element')).toBe(true);
  });

  test('should return true for attachable standard tags', () => {
    expect(isAttachableShadowRoot('articles')).toBe(true);
    expect(isAttachableShadowRoot('aside')).toBe(true);
    expect(isAttachableShadowRoot('blockquote')).toBe(true);
    expect(isAttachableShadowRoot('body')).toBe(true);
    expect(isAttachableShadowRoot('div')).toBe(true);
    expect(isAttachableShadowRoot('footer')).toBe(true);
    expect(isAttachableShadowRoot('h1')).toBe(true);
    expect(isAttachableShadowRoot('h2')).toBe(true);
    expect(isAttachableShadowRoot('h3')).toBe(true);
    expect(isAttachableShadowRoot('h4')).toBe(true);
    expect(isAttachableShadowRoot('h5')).toBe(true);
    expect(isAttachableShadowRoot('h6')).toBe(true);
    expect(isAttachableShadowRoot('header')).toBe(true);
    expect(isAttachableShadowRoot('main')).toBe(true);
    expect(isAttachableShadowRoot('nav')).toBe(true);
    expect(isAttachableShadowRoot('p')).toBe(true);
    expect(isAttachableShadowRoot('section')).toBe(true);
    expect(isAttachableShadowRoot('span')).toBe(true);
  });

  test('should return false for non-attachable standard tags', () => {
    expect(isAttachableShadowRoot('a')).toBe(false);
    expect(isAttachableShadowRoot('img')).toBe(false);
    expect(isAttachableShadowRoot('button')).toBe(false);
  });

});