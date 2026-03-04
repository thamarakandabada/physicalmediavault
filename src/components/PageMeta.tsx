import { Helmet } from "react-helmet-async";

const BASE_URL = "https://physicalmedia.thamara.co.uk";
const DEFAULT_IMAGE =
  "https://storage.googleapis.com/gpt-engineer-file-uploads/QTgeDjrlX4UxA7ZtVBE2FIR2HJr2/social-images/social-1772577228174-Untitled.008.webp";

interface PageMetaProps {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
}

export function PageMeta({
  title = "Thamara's Physical Media Vault",
  description = "A showcase of my small but growing physical media collection. Includes both films and TV.",
  path = "/",
  image = DEFAULT_IMAGE,
}: PageMetaProps) {
  const url = `${BASE_URL}${path}`;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />

      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />

      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
}
