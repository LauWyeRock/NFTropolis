/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify:true,
  images: {
    domains: ["is4302.infura-ipfs.io", "infura-ipfs.io"],
    formats: ["image/webp"],
  }
}

module.exports = nextConfig
