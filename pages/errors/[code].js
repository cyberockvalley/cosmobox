import useTranslation from "next-translate/useTranslation"
import Head from "next/head"
import { useRouter } from "next/router"
import PageBody from "../../components/PageBody"
import { TITLE_SEPARATOR } from "../../utils/constants"

export default function Error({statusCode}) {
    const { t } = useTranslation('error')
    const router = useRouter()
    const code = router?.query?.code || statusCode
    return(
        <div>
            <Head>
                <title>{t(`error_title_${code}`)} {TITLE_SEPARATOR} {t('header:site-name')}</title>
            </Head>
            <PageBody navType={PageBody.vars.NAV_TYPES.others} excludeFooter>
                <div className="page-content d-flex flex-column justify-content-center align-items-center">
                    <div className="fa fa-5x fa-exclamation-triangle p-5 text-danger"></div>
                    <h1>
                        {t(`error_title_${code}`)}
                    </h1>
                    <div className="h3 p-3">
                        {t(`error_content_${code}`)}
                    </div>
                </div>
            </PageBody>
        </div>
    )
}

export async function getStaticProps({params}) {
    if(params.code == 404) {
        return {
            notFound: true
        }

    } else {
        return {
            props: {
                statusCode: params.code
            }
        }
    }
}

export async function getStaticPaths() {
    return {
        paths: [
          { params: { code: "404" } },,
          { params: { code: "400" } },
          { params: { code: "401" } },
          { params: { code: "403" } },
          { params: { code: "500" } }
        ],
        fallback: false
    }
}