import type { Movie } from '@/services';

const UPLOAD_SEGMENT = '/upload/';

/**
 * Applies a Cloudinary transformation to the movie's `image` field and returns
 * the movie with `image` set to the transformed URL.
 *
 * e.g. changeResolution('w_270,f_auto,q_90', movie)
 *   → https://res.cloudinary.com/.../image/upload/w_270,f_auto,q_90/v.../public-id.jpg
 */
export const changeResolution = (transform: string, movie: Movie): Movie => {
  const src = movie.image;
  if (!transform || !src) return movie;
  const idx = src.indexOf(UPLOAD_SEGMENT);
  if (idx === -1) return movie;
  const newImage =
    `${src.slice(0, idx + UPLOAD_SEGMENT.length)}${transform}/${src.slice(idx + UPLOAD_SEGMENT.length)}`;
  return { ...movie, image: newImage };
};
