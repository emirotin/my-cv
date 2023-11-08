import Document, { Html, Head, Main, NextScript } from "next/document";
import config from "../config";

const STYLESHEETS = [
  "https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css",
  "https://cdn.jsdelivr.net/npm/bootswatch@4.5.2/dist/flatly/bootstrap.min.css",
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css",
];

export default class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head>
          <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
          <meta
            name="description"
            content="A CV of Eugene Mirotin, Full-Stack JS developer"
          />
          <meta property="og:image" content="/images/me.jpg" />
          <meta
            name="google-site-verification"
            content={config.GOOGLE_VERIFICATION_CODE}
          />

          <link rel="shortcut icon" href="/fav.ico" type="image/x-icon" />
          <link rel="icon" href="/fav.ico" type="image/x-icon" />

          {STYLESHEETS.map((href) => (
            <link key={href} rel="stylesheet" href={href} />
          ))}

          <link rel="preload" href="/images/display.png" as="image" />

          <script
            async
            src={`https://www.googletagmanager.com/gtag/js?id=${config.GA_ID}`}
          />

          <script
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${config.GA_ID}');
              `,
            }}
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
