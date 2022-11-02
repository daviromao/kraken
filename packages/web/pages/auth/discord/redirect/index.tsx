import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import axios from 'axios';
import { useCallback, useEffect } from 'react';

const DiscordAuth: NextPage = () => {
  const router = useRouter()
  const { code } = router.query
  const response = useCallback(async () => {
    if(code) {
      try {
        const res = await axios.post(`http://localhost:3333/auth/discord/login?code=${code}`);
      } catch (error) {
        console.log(error)
      }

      router.push('/')
    }
  }, [code, router]);
  
  useEffect(() => {
    response();
  }, [response]);

  return (<></>)
}

export default DiscordAuth;