export type Article = {
  id: string;
  title: string;
  image?: string;
  tags?: string[];
  date?: Date | string;
  body?: string;
  slug?: string;
};
