import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function Home() {
    const router = useRouter()

    useEffect(() => {
        router.replace('/admin') // redirect to admin page
    }, [router])

    return null // optional: loading spinner
}
