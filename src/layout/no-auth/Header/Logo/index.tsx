import Image from 'next/image';
import Link from 'next/link';
import withBasePath from '@/utils/basePath';

const Logo: React.FC = () => {
  return (
    <Link href="/">
      <Image
        src={withBasePath('/images/logos/seal-trust-logo.png')}
        alt="logo"
        width={160}
        height={50}
        className="object-contain"
        quality={100}
      />
    </Link>
  );
};

export default Logo;
