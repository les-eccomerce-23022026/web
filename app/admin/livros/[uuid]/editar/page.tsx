import { EditarLivroAdmin } from '@/pages-react-router/CadastroLivros/EditarLivroAdmin/EditarLivroAdmin';
import { use } from 'react';

interface Props {
  params: Promise<{ uuid: string }>;
}

export default function EditarLivroPage({ params }: Props) {
  const { uuid } = use(params);
  return <EditarLivroAdmin uuid={uuid} />;
}
