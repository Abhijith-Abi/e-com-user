import { Helmet } from "react-helmet-async";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  twitterHandle?: string;
}

const SEO = ({
  title,
  description,
  keywords = "ecommerce, shopping, premium, fashion, technology",
  ogTitle,
  ogDescription,
  ogImage,
  ogUrl,
  twitterHandle = "@iqra_mark"
}: SEOProps) => {
  const defaultTitle = "Sebastian Stores - Premium Ethnic Wear";
  const defaultDesc = "Discover the best luxury ethnic fashion at Sebastian Stores. Quality and style guaranteed.";
  
  const finalTitle = title || defaultTitle;
  const finalDesc = description || defaultDesc;
  const siteTitle = finalTitle.includes("Sebastian Stores") ? finalTitle : `${finalTitle} | Sebastian Stores`;
  
  return (
    <Helmet>
      {/* Standard metadata tags */}
      <title>{siteTitle}</title>
      <meta name="description" content={ogDescription || finalDesc} />
      <meta name="keywords" content={keywords} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={ogUrl || window.location.href} />
      <meta property="og:title" content={ogTitle || siteTitle} />
      <meta property="og:description" content={ogDescription || finalDesc} />
      {ogImage && <meta property="og:image" content={ogImage} />}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={twitterHandle} />
      <meta name="twitter:title" content={ogTitle || siteTitle} />
      <meta name="twitter:description" content={ogDescription || finalDesc} />
      {ogImage && <meta name="twitter:image" content={ogImage} />}
    </Helmet>
  );
};

export default SEO;
