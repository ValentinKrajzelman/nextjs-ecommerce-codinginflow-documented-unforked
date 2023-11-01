import PriceTag from "@/components/PriceTag";
import { prisma } from "@/lib/db/prisma";
import { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { cache } from "react";
import AddToCartButton from "./AddToCartButton";
import { incrementProductQuantity } from "./actions";

//esta es la definicion de params donde se especifica el valor dinamico que se recibe
interface ProductPageProps {
  params: {
    id: string;
  };
}

//esta es la funcion para hacer cacheo manual, que tenemos que usar por tener el proyecto setupeado con prisma
const getProduct = cache(async (id: string) => {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) notFound();
  return product;
});

//todas las funciones async devuelven una promesa, se hace el llamado a base por duplicado y next automaticamente
//lo hace una sola vez y lo duplica, pero esto es asi solo cuando usamos el fetch nativo de next, en este caso
//que usamos prisma o si usas axios, tenes que hacer un cacheo manual del dato para no hacer dos llamados paralelos
//que serian un desperdicio de recursos
//generateMetadata es una funcion default que next automaticamente reconoce, asi que el nombre tiene que ser exactamente ese
export async function generateMetadata({params: { id },}: ProductPageProps): Promise<Metadata> {
  const product = await getProduct(id);

  return {
    title: product.name + " - Flowmazon",
    description: product.description,
    openGraph: {
      images: [{ url: product.imageUrl }],
    },
  };
}

export default async function ProductPage({params: { id },}: ProductPageProps) {
  const product = await getProduct(id);

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
      <Image
        src={product.imageUrl}
        alt={product.name}
        width={500}
        height={500}
        className="rounded-lg"
        priority
      />

      <div>
        <h1 className="text-5xl font-bold">{product.name}</h1>
        <PriceTag price={product.price} className="mt-4" />
        <p className="py-6">{product.description}</p>
        <AddToCartButton
          productId={product.id}
          incrementProductQuantity={incrementProductQuantity}
        />
      </div>
    </div>
  );
}
