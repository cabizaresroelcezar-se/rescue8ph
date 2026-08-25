import { ButtonLink } from "@/components/ui/button-link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { XCircle } from "lucide-react";

export default function CheckoutFailedPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <XCircle className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Payment Failed</CardTitle>
          <CardDescription>
            We couldn&apos;t process your payment. Please try again.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-surface p-4 text-sm text-muted-foreground">
            <p>Your order has been saved, but payment was not completed.</p>
            <p className="mt-2">You can:</p>
            <ul className="mt-1 list-disc list-inside">
              <li>Try a different payment method</li>
              <li>Contact us for assistance</li>
              <li>Choose Cash on Delivery instead</li>
            </ul>
          </div>
          <div className="flex gap-3">
            <ButtonLink href="/cart" className="flex-1">
              Back to Cart
            </ButtonLink>
            <ButtonLink href="/contact" variant="outline" className="flex-1">
              Contact Support
            </ButtonLink>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}