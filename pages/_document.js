import Document, { Head, Main, NextScript } from "next/document";
import config from "../config";

export default class MyDocument extends Document {
  render() {
    return (
      <html>
        <Head>
          <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
          <meta
            name="viewport"
            content="initial-scale=1.0, width=device-width"
          />

          <meta
            name="description"
            content="A CV of Eugene Mirotin, front-end and Node.js developer"
          />
          <meta property="og:image" content="/static/images/me.jpg" />

          <meta
            name="google-site-verification"
            content={config.GOOGLE_VERIFICATION_CODE}
          />

          <link
            rel="shortcut icon"
            href="/static/fav.ico"
            type="image/x-icon"
          />
          <link rel="icon" href="/static/fav.ico" type="image/x-icon" />
          <link rel="stylesheet" href="/_next/static/style.css" />

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
              `
            }}
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </html>
    );
  }
}
