"use client"

import React from 'react';
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";

type ProvidersPropsType = {
    children: React.ReactNode;
};

export const Providers = ({children}: ProvidersPropsType) => {
    const queryClient = new QueryClient();
    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
};
