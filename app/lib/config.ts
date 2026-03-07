export const config = {

    // apiUrl: 'http://35.186.144.224:80/api',

    apiUrl: process.env.NEXT_PUBLIC_API_URL ,
// 
    // apiUrlImage: 'http://35.186.144.224:80',

    apiUrlImage: process.env.NEXT_PUBLIC_API_URL_IMAGE,
// 
    apiKey: process.env.NEXT_PUBLIC_API_KEY,
    apiUrlZoo: process.env.NEXT_PUBLIC_API_URL_ZOO,
    apiZookey: process.env.NEXT_PUBLIC_API_ZOO_KEY
}
