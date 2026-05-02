import { useParams, useNavigate } from "react-router-dom";

import CheckHeroSection from "../sections/Check-hero-section";
import ProductsSection from "../sections/Products-section";
import CheckExchangeSection from "../sections/Check-exchange-section";

// mock
import { checks } from "../data/checks";

const Check = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const check = checks.find((c) => c.id === Number(id));


  const handleDelete = () => {

    navigate("/");
  };

  if (!check) return null;

  return (
    <>
      <CheckHeroSection check={check} />

      <ProductsSection products={check?.products} />

      <CheckExchangeSection
        checkId={id}
        onDelete={handleDelete}
      />
    </>
  );
};

export default Check;