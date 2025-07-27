import './styles.css';
import 'react-quill/dist/quill.snow.css';
import 'react-quill/dist/quill.bubble.css';

import ImageResize from 'quill-image-resize-module-react';
import type { ComponentProps } from 'react';
import ReactQuill, { Quill } from 'react-quill';

Quill.register('modules/imageResize', ImageResize);

const modules = {
  clipboard: {
    // toggle to add extra line breaks when pasting HTML:
    matchVisual: false,
  },
  imageResize: {
    modules: ['Resize', 'DisplaySize', 'Toolbar'],
    parchment: Quill.import('parchment'),
  },
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    [
      {
        color: [],
      },
      { background: [] },
    ],

    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
    [
      { list: 'ordered' },
      { list: 'bullet' },
      { indent: '-1' },
      { indent: '+1' },
    ],

    [
      { align: '' },
      { align: 'center' },
      { align: 'right' },
      { align: 'justify' },
    ],

    ['link', 'image'],
    // ["clean"],
  ],
};

const formats = [
  'header',
  'bold',
  'italic',
  'underline',
  'strike',
  'blockquote',
  'list',
  'bullet',
  'indent',
  'align',
  'link',
  'image',
  'color',
  'background',
  // "clean",
];

export const RichTextEditor = (props: ComponentProps<typeof ReactQuill>) => (
  <ReactQuill theme="snow" modules={modules} formats={formats} {...props} />
);
