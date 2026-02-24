  import { Link, useNavigate } from 'react-router-dom';
  import './DetalhesLivro.css';
  import { useDetalhesLivro } from '@/hooks/useLivros';
  import { useAppDispatch } from '@/store/hooks';
  import { adicionarItem } from '@/store/slices/carrinhoSlice';
  import { LoadingState } from '@/components/comum/LoadingState/LoadingState';
  import { ErrorState } from '@/components/comum/ErrorState/ErrorState';
  
  export function DetalhesLivro() {
    const { livro: data, loading, error } = useDetalhesLivro('some-id');
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
  
    if (loading) return <LoadingState message="Buscando detalhes do livro..." />;
    if (error) return <ErrorState message="Não foi possível carregar os detalhes do livro." onRetry={() => window.location.reload()} />;
    if (!data) return <p style={{ padding: '20px' }}>Livro não encontrado.</p>;
  
    const handleAdicionarAoCarrinho = () => {
      dispatch(adicionarItem({
        uuid: data.uuid,
        imagem: data.imagem || '',
        titulo: data.titulo,
        isbn: '000-00-00000-00-0',
        precoUnitario: data.preco,
        quantidade: 1,
        subtotal: data.preco
      }));
      navigate('/carrinho');
    };
  
    return (
      <div className="detalhes-livro page-transition-enter">
        <div className="breadcrumb detalhes-breadcrumb">
          <span className="detalhes-breadcrumb-path">
            <Link to="/" className="breadcrumb-link">Início</Link>
            {data.categorias?.map((cat, index) => (
              <span key={index}>
                {' > '}
                <Link
                  to={`/categoria/${cat.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-')}`}
                  className="breadcrumb-link"
                >
                  {cat}
                </Link>
              </span>
            ))}
            {' > '}
            <strong className="detalhes-breadcrumb-current">{data.titulo}</strong>
          </span>
        </div>
  
        <div className="detalhes-grid">
          <div className="coluna-imagem">
            <div className="imagem-destaque detalhes-imagem-destaque">
              <img src={data.imagem} className="detalhes-img" alt="Livro" />
            </div>
          </div>
          
          <div className="coluna-info">
            <h1 className="detalhes-title">{data.titulo}</h1>
            <p className="detalhes-author">por <a href="#" className="detalhes-author-link">{data.autor}</a></p>
            
            <div className="rating detalhes-rating">
              {'★'.repeat(data.estrelas || 0)}{'☆'.repeat(5-(data.estrelas || 0))} <span className="detalhes-rating-count">({data.numeroAvaliacoes} avaliações)</span>
            </div>
  
            <div className="pricing detalhes-pricing">
              <h2 className="detalhes-price">R$ {data.preco.toFixed(2).replace('.', ',')}</h2>
              <button onClick={handleAdicionarAoCarrinho} className="btn-primary detalhes-btn-add">Adicionar ao Carrinho</button>
            </div>

          <div className="sinopse">
            <h3>Sinopse</h3>
            <hr className="detalhes-synopsis-divider" />
            <p className="detalhes-synopsis-text">{data.sinopse}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
