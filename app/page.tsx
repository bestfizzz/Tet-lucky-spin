import { getFingerprintCookie } from '@/lib/cookies';
import { getSpin } from '@/app/actions/get-spin';
import PageContent from './components/PageContent';

export default async function Home() {
  // Server-side: check for existing spin
  const fingerprintHash = await getFingerprintCookie();
  let existingSpin = null;

  if (fingerprintHash) {
    existingSpin = await getSpin(fingerprintHash);
  }

  return <PageContent existingSpin={existingSpin} />;
}
