
"use client";
import { PutForm } from "@/components/forms/putForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PutOptionList } from "@/components/sections/putOptionList";
import { MyOptions } from "@/components/sections/myOptions"; // Assurez-vous d'avoir ce composant

export default function Home() {
  return ( 
    <section className="container">
      <PutForm />
      <Card className="w-full container mx-auto shadow-lg mb-10 mt-10">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Put Options Dashboard
          </CardTitle>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="allOptions" className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-fit">
              <TabsTrigger value="allOptions" className="text-lg py-1">
                Available & Created Options
              </TabsTrigger>
              <TabsTrigger value="myOptions" className="text-lg py-1">
                Claimed & Bought Options
              </TabsTrigger>
            </TabsList>

            <TabsContent value="allOptions">
              <PutOptionList />
            </TabsContent>

            <TabsContent value="myOptions">
              <MyOptions />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </section>
  );
}

