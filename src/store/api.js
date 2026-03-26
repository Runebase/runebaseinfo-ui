import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

function formatDateParam(date) {
  let yyyy = date.getUTCFullYear().toString()
  let mm = (date.getUTCMonth() + 1).toString().padStart(2, '0')
  let dd = date.getUTCDate().toString().padStart(2, '0')
  return yyyy + '-' + mm + '-' + dd
}

export const api = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: '/api/' }),
  keepUnusedDataFor: 300,
  refetchOnFocus: false,
  refetchOnReconnect: false,
  endpoints: (builder) => ({
    // Block
    getBlock: builder.query({
      query: (id) => `block/${id}`,
    }),
    getRecentBlocks: builder.query({
      query: () => 'recent-blocks',
    }),
    getBlocksByDate: builder.query({
      query: (date) => ({
        url: 'blocks',
        params: { date: date || formatDateParam(new Date()) },
      }),
    }),

    // Address
    getAddress: builder.query({
      query: (id) => `address/${id}`,
    }),
    getAddressBalance: builder.query({
      query: (id) => `address/${id}/balance`,
    }),
    getAddressTransactions: builder.query({
      query: ({ id, page, pageSize }) => ({
        url: `address/${id}/txs`,
        params: { page, pageSize },
      }),
    }),
    getAddressBalanceTransactions: builder.query({
      query: ({ id, page, pageSize }) => ({
        url: `address/${id}/balance-history`,
        params: { page, pageSize },
      }),
    }),
    getAddressTokenBalanceTransactions: builder.query({
      query: ({ id, token, page, pageSize }) => ({
        url: token
          ? `address/${id}/qrc20-balance-history/${token}`
          : `address/${id}/qrc20-balance-history`,
        params: { page, pageSize },
      }),
    }),

    // Transaction
    getTransaction: builder.query({
      query: (id) => `tx/${id}`,
    }),
    getTransactionBrief: builder.query({
      query: (id) => ({ url: `tx/${id}`, params: { brief: '' } }),
    }),
    getTransactionsBrief: builder.query({
      queryFn: async (ids, _queryApi, _extraOptions, fetchWithBQ) => {
        if (ids.length === 0) return { data: [] }
        const result = await fetchWithBQ({
          url: `txs/${ids.join(',')}`,
          params: { brief: '' },
        })
        return result.error ? { error: result.error } : { data: result.data }
      },
    }),
    getRecentTransactions: builder.query({
      query: () => 'recent-txs',
    }),

    // Contract
    getContract: builder.query({
      query: (id) => `contract/${id}`,
    }),
    getContractTransactions: builder.query({
      query: ({ id, page, pageSize }) => ({
        url: `contract/${id}/txs`,
        params: { page, pageSize },
      }),
    }),
    listTokens: builder.query({
      query: ({ page, pageSize }) => ({
        url: 'qrc20',
        params: { page, pageSize },
      }),
    }),
    contractRichList: builder.query({
      query: ({ id, page, pageSize }) => ({
        url: `qrc20/${id}/rich-list`,
        params: { page, pageSize },
      }),
    }),

    // Misc
    getInfo: builder.query({
      query: () => 'info',
    }),
    getDailyTransactions: builder.query({
      query: () => 'stats/daily-transactions',
    }),
    getBlockInterval: builder.query({
      query: () => 'stats/block-interval',
    }),
    getAddressGrowth: builder.query({
      query: () => 'stats/address-growth',
    }),
    getRichList: builder.query({
      query: ({ from, to }) => ({
        url: 'misc/rich-list',
        params: { page: from / (to - from), pageSize: to - from },
      }),
    }),
    getBiggestMiners: builder.query({
      query: ({ from, to }) => ({
        url: 'misc/biggest-miners',
        params: { page: from / (to - from), pageSize: to - from },
      }),
    }),

    // Search
    search: builder.query({
      query: (query) => ({ url: 'search', params: { query } }),
    }),

    // Mutations
    sendRawTransaction: builder.mutation({
      query: (rawtx) => ({
        url: 'tx/send',
        method: 'POST',
        body: { rawtx },
      }),
    }),

    // Compound queries
    getAddressTransactionsWithBrief: builder.query({
      queryFn: async ({ id, page, pageSize }, _queryApi, _extraOptions, fetchWithBQ) => {
        const txResult = await fetchWithBQ({
          url: `address/${id}/txs`,
          params: { page, pageSize },
        })
        if (txResult.error) return { error: txResult.error }
        const { totalCount, transactions: txIds } = txResult.data
        if (!txIds || txIds.length === 0) return { data: { totalCount, transactions: [] } }
        const briefResult = await fetchWithBQ({
          url: `txs/${txIds.join(',')}`,
          params: { brief: '' },
        })
        return briefResult.error
          ? { error: briefResult.error }
          : { data: { totalCount, transactions: briefResult.data } }
      },
    }),

    getBlockWithTransactions: builder.query({
      queryFn: async ({ id, page, pageSize }, _queryApi, _extraOptions, fetchWithBQ) => {
        const blockResult = await fetchWithBQ(`block/${id}`)
        if (blockResult.error) return { error: blockResult.error }
        const block = blockResult.data
        const txIds = block.transactions.slice((page - 1) * pageSize, page * pageSize)
        if (txIds.length === 0) return { data: { block, transactions: [] } }
        const briefResult = await fetchWithBQ({
          url: `txs/${txIds.join(',')}`,
          params: { brief: '' },
        })
        return briefResult.error
          ? { error: briefResult.error }
          : { data: { block, transactions: briefResult.data } }
      },
    }),

    getContractTransactionsWithBrief: builder.query({
      queryFn: async ({ id, page, pageSize }, _queryApi, _extraOptions, fetchWithBQ) => {
        const txResult = await fetchWithBQ({
          url: `contract/${id}/txs`,
          params: { page, pageSize },
        })
        if (txResult.error) return { error: txResult.error }
        const { totalCount, transactions: txIds } = txResult.data
        if (!txIds || txIds.length === 0) return { data: { totalCount, transactions: [] } }
        const briefResult = await fetchWithBQ({
          url: `txs/${txIds.join(',')}`,
          params: { brief: '' },
        })
        return briefResult.error
          ? { error: briefResult.error }
          : { data: { totalCount, transactions: briefResult.data } }
      },
    }),
  }),
})

export const {
  useGetBlockQuery,
  useLazyGetBlockQuery,
  useGetRecentBlocksQuery,
  useLazyGetRecentBlocksQuery,
  useGetBlocksByDateQuery,
  useGetAddressQuery,
  useLazyGetAddressQuery,
  useGetAddressBalanceQuery,
  useLazyGetAddressBalanceQuery,
  useGetAddressTransactionsQuery,
  useLazyGetAddressTransactionsQuery,
  useGetAddressBalanceTransactionsQuery,
  useLazyGetAddressBalanceTransactionsQuery,
  useGetAddressTokenBalanceTransactionsQuery,
  useGetTransactionQuery,
  useLazyGetTransactionQuery,
  useGetTransactionBriefQuery,
  useLazyGetTransactionBriefQuery,
  useGetTransactionsBriefQuery,
  useLazyGetTransactionsBriefQuery,
  useGetRecentTransactionsQuery,
  useLazyGetRecentTransactionsQuery,
  useGetContractQuery,
  useGetContractTransactionsQuery,
  useListTokensQuery,
  useContractRichListQuery,
  useGetInfoQuery,
  useLazyGetInfoQuery,
  useGetDailyTransactionsQuery,
  useGetBlockIntervalQuery,
  useGetAddressGrowthQuery,
  useGetRichListQuery,
  useGetBiggestMinersQuery,
  useSearchQuery,
  useSendRawTransactionMutation,
  useGetAddressTransactionsWithBriefQuery,
  useGetBlockWithTransactionsQuery,
  useGetContractTransactionsWithBriefQuery,
} = api
