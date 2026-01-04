/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD. */
/* DO NOT MODIFY IT BECAUSE IT COULD BE REWRITTEN AT ANY TIME. */
import type { Metadata, Viewport } from 'next'
import config from '@payload-config'
import { RootPage, generatePageMetadata } from '@payloadcms/next/views'
import { importMap } from '../importMap'

type Args = {
  params: Promise<{
    segments: string[]
  }>
  searchParams: Promise<{
    [key: string]: string | string[]
  }>
}

export const generateViewport = (): Viewport => ({
  themeColor: '#10b981',
})

export const generateMetadata = async ({ params, searchParams }: Args): Promise<Metadata> => {
  const metadata = await generatePageMetadata({ config, params, searchParams })
  // Remove themeColor from metadata as it's now in viewport
  const { themeColor: _themeColor, ...rest } = metadata as Metadata & { themeColor?: string }
  return rest
}

const Page = ({ params, searchParams }: Args) =>
  RootPage({ config, params, searchParams, importMap })

export default Page
