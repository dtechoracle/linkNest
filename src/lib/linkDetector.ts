import { Youtube, Music2, Github, Twitter, Instagram, Facebook, Link } from 'lucide-react';

type LinkInfo = {
  icon: typeof Link;
  color: string;
  name: string;
};

export const detectLinkInfo = (url: string): LinkInfo => {
  const urlObj = new URL(url);
  const hostname = urlObj.hostname.toLowerCase();

  if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
    return { icon: Youtube, color: 'text-red-600', name: 'YouTube' };
  }
  if (hostname.includes('spotify.com')) {
    return { icon: Music2, color: 'text-green-500', name: 'Spotify' };
  }
  if (hostname.includes('github.com')) {
    return { icon: Github, color: 'text-gray-800', name: 'GitHub' };
  }
  if (hostname.includes('twitter.com') || hostname.includes('x.com')) {
    return { icon: Twitter, color: 'text-blue-400', name: 'Twitter' };
  }
  if (hostname.includes('instagram.com')) {
    return { icon: Instagram, color: 'text-pink-600', name: 'Instagram' };
  }
  if (hostname.includes('facebook.com')) {
    return { icon: Facebook, color: 'text-blue-600', name: 'Facebook' };
  }

  return { icon: Link, color: 'text-gray-600', name: 'Link' };
};