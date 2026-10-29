'use strict';
const config = window.PROJECT;
const loaded = new Set();
const gallery = document.querySelector('#gallery');
const dialog = document.querySelector('#lightbox');
let current = 0;
let returnFocus;
function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}
config.photos.forEach((photo, index) => {
  const card = element('figure', 'photo');
  const visual = element('div', 'photo-visual');
  const fallback = element('div', 'photo-placeholder');
  fallback.append(element('span', '', 'Здесь будет ваша ИИ-визуализация'), element('small', '', `Фото ${String(index + 1).padStart(2, '0')}`));
  const button = element('button', 'photo-button');
  button.type = 'button';
  button.disabled = true;
  button.setAttribute('aria-label', `Открыть: ${photo.title}`);
  const img = element('img');
  img.alt = photo.title;
  img.hidden = true;
  img.decoding = 'async';
  img.loading = 'lazy';
  const zoom = element('span', 'zoom', '↗');
  zoom.setAttribute('aria-hidden', 'true');
  zoom.hidden = true;
  img.addEventListener('load', () => {
    loaded.add(index);
    fallback.hidden = true;
    img.hidden = false;
    zoom.hidden = false;
    button.disabled = false;
  });
  img.addEventListener('error', () => {
    loaded.delete(index);
    fallback.hidden = false;
    img.hidden = true;
    zoom.hidden = true;
    button.disabled = true;
  });
  img.src = photo.src;
  button.append(fallback, img, zoom);
  button.addEventListener('click', () => openImage(index, button));
  visual.append(button, element('span', 'media-tag', 'ИИ-КОНЦЕПЦИЯ'));
  const caption = element('figcaption');
  const meta = element('div', 'photo-meta');
  meta.append(element('span', '', photo.category), element('span', '', String(index + 1).padStart(2, '0')));
  caption.append(meta, element('h3', '', photo.title), element('p', '', photo.description));
  card.append(visual, caption);
  gallery.append(card);
});
function renderVideo(target, data) {
  const root = document.querySelector(target);
  const stage = element('div', 'video-stage');
  const empty = element('div', 'video-empty');
  const icon = element('span', 'video-icon', '▷');
  icon.setAttribute('aria-hidden', 'true');
  empty.append(icon, element('h4', '', data.title), element('p', '', data.description), element('small', '', 'Видео скоро появится здесь'));
  const video = element('video');
  video.controls = true;
  video.preload = 'metadata';
  video.playsInline = true;
  video.hidden = true;
  video.setAttribute('aria-label', data.title);
  if (data.poster) video.poster = data.poster;
  video.addEventListener('loadedmetadata', () => { video.hidden = false; empty.hidden = true; });
  video.addEventListener('error', () => { video.hidden = true; empty.hidden = false; });
  video.src = data.src;
  stage.append(empty, video);
  const footer = element('div', 'video-footer');
  footer.append(element('strong', '', data.title), element('span', '', data.label));
  root.append(stage, footer);
}
renderVideo('#ai-film', config.aiVideo);
renderVideo('#kids-film', config.kidsVideo);
function showImage(index) {
  current = index;
  const photo = config.photos[index];
  const image = document.querySelector('#lightbox-image');
  image.src = photo.src;
  image.alt = photo.title;
  document.querySelector('#lightbox-title').textContent = photo.title;
  const available = [...loaded].sort((a, b) => a - b);
  document.querySelector('#image-counter').textContent = `${available.indexOf(index) + 1} / ${available.length}`;
  document.querySelector('#previous').disabled = available.length < 2;
  document.querySelector('#next').disabled = available.length < 2;
}
function openImage(index, trigger) {
  if (!loaded.has(index)) return;
  returnFocus = trigger;
  showImage(index);
  dialog.showModal();
  document.body.classList.add('modal-open');
}
function moveImage(direction) {
  const available = [...loaded].sort((a, b) => a - b);
  if (!available.length) return;
  showImage(available[(available.indexOf(current) + direction + available.length) % available.length]);
}
document.querySelector('#close-lightbox').addEventListener('click', () => dialog.close());
dialog.addEventListener('close', () => { document.body.classList.remove('modal-open'); returnFocus?.focus(); });
dialog.addEventListener('click', event => { if (event.target === dialog) { const rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close(); } });
document.querySelector('#previous').addEventListener('click', () => moveImage(-1));
document.querySelector('#next').addEventListener('click', () => moveImage(1));
dialog.addEventListener('keydown', event => { if (event.key === 'ArrowLeft') { event.preventDefault(); moveImage(-1); } if (event.key === 'ArrowRight') { event.preventDefault(); moveImage(1); } });
