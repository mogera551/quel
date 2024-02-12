import { AttachShadow } from '../../src/component/AttachShadow';

describe('AttachShadow', () => {
  describe('isCustomTag', () => {
    it('should return true for custom tags', () => {
      // Test custom tags
      expect(AttachShadow.isCustomTag('my-custom-tag')).toBe(true);
      expect(AttachShadow.isCustomTag('another-custom-tag')).toBe(true);
    });

    it('should return false for non-custom tags', () => {
      // Test non-custom tags
      expect(AttachShadow.isCustomTag('div')).toBe(false);
      expect(AttachShadow.isCustomTag('span')).toBe(false);
    });
  });

  describe('isAttachable', () => {
    it('should return true for attachable tags', () => {
      // Test attachable tags
      expect(AttachShadow.isAttachable('articles')).toBe(true);
      expect(AttachShadow.isAttachable('aside')).toBe(true);
      expect(AttachShadow.isAttachable('blockquote')).toBe(true);
      expect(AttachShadow.isAttachable('body')).toBe(true);
      expect(AttachShadow.isAttachable('div')).toBe(true);
      expect(AttachShadow.isAttachable('footer')).toBe(true);
      expect(AttachShadow.isAttachable('h1')).toBe(true);
      expect(AttachShadow.isAttachable('h2')).toBe(true);
      expect(AttachShadow.isAttachable('h3')).toBe(true);
      expect(AttachShadow.isAttachable('h4')).toBe(true);
      expect(AttachShadow.isAttachable('h5')).toBe(true);
      expect(AttachShadow.isAttachable('h6')).toBe(true);
      expect(AttachShadow.isAttachable('header')).toBe(true);
      expect(AttachShadow.isAttachable('main')).toBe(true);
      expect(AttachShadow.isAttachable('nav')).toBe(true);
      expect(AttachShadow.isAttachable('p')).toBe(true);
      expect(AttachShadow.isAttachable('section')).toBe(true);
      expect(AttachShadow.isAttachable('span')).toBe(true);
    });

    it('should return false for non-attachable tags', () => {
      // Test non-attachable tags
      expect(AttachShadow.isAttachable('table')).toBe(false);
      expect(AttachShadow.isAttachable('thead')).toBe(false);
    });
  });
});
