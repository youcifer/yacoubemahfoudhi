// Series + photo metadata. Each photo: [width, height] — used to reserve space (no layout shift)
// and to build the justified grid. Files live in /public/images/<id>-NN.jpg

export const photographer = {
  name: 'Yacoube Mahfoudhi',
  email: 'mahfoudhiyacoube@gmail.com',
  phone: '+216 92 256 595',
  about:
    'Passionate photographer specialized in portrait, event, and product photography. My approach combines artistic sensitivity with strong attention to detail in order to capture authentic, luminous, and expressive images. Available for collaborations, creative projects, and professional assignments.',
  disciplines: ['Portrait', 'Event', 'Product'],
};

export const series = [
  {
    id: 'wedding',
    title: 'Wedding',
    note: 'Tunisian ceremony, gold embroidery, the exchange of rings.',
    photos: [[1400, 933], [1400, 934], [1400, 933], [1400, 933]],
  },
  {
    id: 'portrait',
    title: 'Portrait',
    note: 'Soft light, glass and marble, a different look in every frame.',
    photos: [[933, 1400], [1400, 933], [934, 1400], [1400, 934], [1400, 934], [1400, 933]],
  },
  {
    id: 'heritage',
    title: 'Heritage',
    note: 'Archive restoration: old press clippings and the gestures of the workshop.',
    photos: [[1400, 933], [1400, 933], [1400, 933], [1400, 933], [1400, 934], [1400, 933]],
  },
  {
    id: 'concert',
    title: 'Concert',
    note: 'Voice, percussion and stage smoke: music up close.',
    photos: [[1300, 731], [1300, 731], [1300, 731], [1300, 731], [1300, 731]],
  },
  {
    id: 'sports',
    title: 'Sports activity',
    note: 'A day of adventure under the palm trees: climbing, zip line, archery.',
    photos: Array.from({ length: 9 }, () => [1300, 729]),
  },
  {
    id: 'night',
    title: 'Night performance',
    note: 'A performance under rain and spotlights, in monochrome.',
    photos: [[1280, 717], [1280, 717], [1280, 717], [1280, 717]],
  },
  {
    id: 'street',
    title: 'Street photography',
    note: 'Staircases, façades, domes and minarets: the city in lines and geometry.',
    photos: [[1300, 1300], [1300, 866], [1300, 867], [1300, 731], [1300, 866]],
  },
].map((s) => ({
  ...s,
  photos: s.photos.map(([w, h], i) => ({
    src: `/images/${s.id}-${String(i + 1).padStart(2, '0')}.jpg`,
    w,
    h,
    alt: `${s.title} — frame ${i + 1} by Yacoube Mahfoudhi`,
    seriesId: s.id,
    seriesTitle: s.title,
    n: i + 1,
  })),
}));

export const allPhotos = series.flatMap((s) => s.photos);
