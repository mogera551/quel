import "jest";
import { getExpandableComments } from '../../src/binder/getExpandableComments';

describe('getExpandableComments', () => {
  it('should return an empty array when there are no comments', () => {
    const div = document.createElement('div');
    expect(getExpandableComments(div)).toEqual([]);
  });

  it('should return an empty array when there are comments but none are expandable', () => {
    const div = document.createElement('div');
    div.appendChild(document.createComment('This is a comment'));
    div.appendChild(document.createComment('Another comment'));
    expect(getExpandableComments(div)).toEqual([]);
  });

  it('should return expandable comments when they exist', () => {
    const div = document.createElement('div');
    const comment1 = document.createComment('@@: This is an expandable comment');
    const comment2 = document.createComment('@@| Another expandable comment');
    const comment3 = document.createComment('This is not expandable');
    div.appendChild(comment1);
    div.appendChild(comment2);
    div.appendChild(comment3);

    expect(getExpandableComments(div)).toEqual([comment1, comment2]);
  });

  it('should return expandable comments from nested nodes', () => {
    const div = document.createElement('div');
    const span = document.createElement('span');
    const comment1 = document.createComment('@@: This is an expandable comment');
    const comment2 = document.createComment('@@| Another expandable comment');
    const comment3 = document.createComment('This is not expandable');
    span.appendChild(comment1);
    span.appendChild(comment2);
    div.appendChild(span);
    div.appendChild(comment3);

    expect(getExpandableComments(div)).toEqual([comment1, comment2]);
  });

  it('should handle deeply nested expandable comments', () => {
    const div = document.createElement('div');
    const span = document.createElement('span');
    const p = document.createElement('p');
    const comment1 = document.createComment('@@: This is an expandable comment');
    const comment2 = document.createComment('@@| Another expandable comment');
    const comment3 = document.createComment('This is not expandable');
    p.appendChild(comment1);
    span.appendChild(p);
    span.appendChild(comment2);
    div.appendChild(span);
    div.appendChild(comment3);

    expect(getExpandableComments(div)).toEqual([comment1, comment2]);
  });

});