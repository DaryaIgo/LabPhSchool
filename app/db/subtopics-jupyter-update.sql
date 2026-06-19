-- Update Jupyter notebook links for subtopics that have them locally.
-- Import this after topic_nodes are in place (order does not matter for this file).

UPDATE `subtopics`
SET `jupyter_url` = 'https://colab.research.google.com/drive/1OXJsYuDLqnRhd3fCEC5pxSJq4bouf0o5#scrollTo=9w0__ZlyLA67'
WHERE `title` = 'Равномерное прямолинейное движение';

UPDATE `subtopics`
SET `jupyter_url` = 'https://colab.research.google.com/drive/1PcNF0MfoVb93NxohEt7qvX6GQgkwxH-v#scrollTo=PA-IBasOqtFe'
WHERE `title` = 'Равноускоренное движение';
