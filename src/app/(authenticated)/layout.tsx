'use client';

import '../globals.scss'
import './home.scss'
import ActiveLinkButton from '../../../components/activeLinkButton/activeLinkButton';
import { useEffect, useState } from 'react';
import { auth } from '../../../services/firebase';
import { usePathname, useRouter } from 'next/navigation';
import { checkIsPublicRoute } from '@/constants/check-public-route';
import PrivateRoute from '@/constants/private-route';
import { APP_ROUTES } from '@/constants/app-routes';;
import { signOut } from 'firebase/auth';
import { IUser } from '../interfaces/user.interface';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRightFromBracket, fas } from '@fortawesome/free-solid-svg-icons';
import { library } from '@fortawesome/fontawesome-svg-core';
library.add(fas);

// export const metadata = {
//   title: 'Home | TasksFor',
//   description: 'Generated by create next app',
// }

export default function RootLayout({ children }: { children: React.ReactNode } ) {
  const router = useRouter();
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<IUser>();

  const isPublicPage = checkIsPublicRoute(String(pathname));

  auth.onAuthStateChanged(userLogged => {
    if(!userLogged)
      localStorage.removeItem('uid');

    console.log('onAuthStateChanged >> ', userLogged)
  })

  useEffect(() => {
    const uidUser = localStorage.getItem('uid');
    getUser(uidUser!);
  }, []);

  async function getUser(id: string) {
    await fetch(`api/user/user-controller?id=${id}`)
      .then((res) => res.json())
      .then((data) => {
        setCurrentUser(data);
      })
  } 

  async function logout() {
    signOut(auth).then(() => {
      localStorage.removeItem('uid');
      localStorage.removeItem('token');
      router.push(APP_ROUTES.public.login);
    }).catch((error) => {
      console.log('error LOGOUT', error)
    });
  }

  return (
    <>
      <html lang="en">
        <body>
          { !isPublicPage && 
            <PrivateRoute>
              <header>
                <h1>TasksFor</h1>
                <nav>
                  <ul>
                    <ActiveLinkButton title={'Inicio'} href={'/'} />
                    <ActiveLinkButton title={'Quadro'} href={'/tasks'} />
                    <ActiveLinkButton title={'Equipe'} href={'/users'} />
                    <button className="link" onClick={logout} >
                      { currentUser?.name }
                      <FontAwesomeIcon icon={faArrowRightFromBracket} />
                      </button>
                  </ul>
                </nav>
              </header>

              <main>
                { children }
              </main>
            </PrivateRoute>
          }
        </body>
      </html>
    </>
  )
}
