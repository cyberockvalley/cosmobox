
import useTranslation from "next-translate/useTranslation";
import { useRouter } from "next/router";
import ReactPagination from "react-js-pagination";

const queryString = require('query-string')

export default function Pagination({placement, rowsPerPage, totalItems, page, range}) {
    const { t } = useTranslation('common')
    const router = useRouter()
    const parsedUrl = queryString.parseUrl(router.asPath)
    var url = parsedUrl.url

    const getPageUrl = queries => {
        var query = {...parsedUrl.query, ...queries}
        return queryString.stringifyUrl({url: url, query: query})

    }
    const handlePageChange = (pageNumber) => {
        router.push(getPageUrl({page: pageNumber}))
    }

    return (
        <div className={`d-flex aligm-items-center ${placement? `justify-content-${placement}` : ''}`}>
            <ReactPagination
                activePage={page}
                itemsCountPerPage={rowsPerPage}
                totalItemsCount={totalItems}
                pageRangeDisplayed={range}
                onChange={handlePageChange}
                itemClass="page-item"
                linkClass="page-link"
                getPageUrl={getPageUrl}
                firstPageText="⟨⟨"
                prevPageText="⟨"
                nextPageText="⟩"
                lastPageText="⟩⟩"
            />
        </div>
    )
}

Pagination.getPageUrl = (router, queries) => {
    const parsedUrl = queryString.parseUrl(router.asPath)
    var url = parsedUrl.url

    var query = {...parsedUrl.query, ...queries}
    return queryString.stringifyUrl({url: url, query: query})
}