import rst2html from 'rst2html';

const rst = `
===========
Заголовок
===========

Подзаголовок
------------

Это **жирный** текст и *курсив*.

- Пункт 1
- Пункт 2
  - Вложенный пункт

1. Нумерованный 1
2. Нумерованный 2

.. math::

   E = mc^2

Текст после формулы.
`;

try {
  const html = rst2html(rst);
  console.log(html);
} catch (e) {
  console.error("Error:", e.message);
}
