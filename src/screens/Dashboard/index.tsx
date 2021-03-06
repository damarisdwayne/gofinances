import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import { useTheme } from 'styled-components';
import { HighLightCard } from '../../components/HighLightCard';
import { TransactionCard, TransactionCardProps } from '../../components/TransactionCard';

import {
    Container,
    Header,
    UserWrapper,
    UserInfo,
    Photo,
    User,
    UserGreeting,
    UserName,
    IconPower,
    HighLightCards,
    Transactions,
    Title,
    TransctionsList,
    LoadingContainer

} from './styles';

export interface DataListProps extends TransactionCardProps {
    id: string
}

interface HighLightProps {
    amount: string
    lastTransaction: string
}

interface HighlightData {
    entries: HighLightProps
    expensives: HighLightProps
    total: HighLightProps
}

export function Dashboard({ id }: DataListProps) {
    const [isLoading, setIsLoading] = useState(true)
    const [transactions, setTransactions] = useState<DataListProps[]>([])
    const [highlightData, setHighlightData] = useState<HighlightData>({} as HighlightData)

    const theme = useTheme()

    function getLastTransactionDate(
        collection: DataListProps[],
        type: 'positive' | 'negative'
    ) {
        const lastTransactions =
            Math.max.apply(Math, collection
                .filter(transaction => transaction.type === type)
                .map(transaction => new Date(transaction.date).getTime()))

        return Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: 'long'
        }).format(new Date(lastTransactions))
    }

    async function loadTransactions() {
        const dataKey = '@gofinances:transactions'
        const response = await AsyncStorage.getItem(dataKey)
        const transactions = response ? JSON.parse(response) : []

        let entriesTotal = 0
        let expensiveTotal = 0

        const transactionsFormatted: DataListProps[] = transactions
            .map((item: DataListProps) => {

                if (item.type === 'positive') {
                    entriesTotal += Number(item.amount)
                } else {
                    expensiveTotal += Number(item.amount)
                }

                const amount = Number(item.amount)
                    .toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                    })

                const date = Intl.DateTimeFormat('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: '2-digit'
                }).format(new Date(item.date))

                return {
                    id: item.id,
                    name: item.name,
                    amount,
                    type: item.type,
                    category: item.category,
                    date,
                }
            })

        setTransactions(transactionsFormatted)

        const lastTransactionsEntries = getLastTransactionDate(transactions, 'positive')
        const lastTransactionsExpensives = getLastTransactionDate(transactions, 'negative')
        const totalInterval = `01 a ${lastTransactionsExpensives}`


        let total = entriesTotal - expensiveTotal

        setHighlightData({
            entries: {
                amount: entriesTotal.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                }),
                lastTransaction: `??ltima entrada dia ${lastTransactionsEntries}`,
            },
            expensives: {
                amount: expensiveTotal.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                }),
                lastTransaction: `??ltima sa??da dia ${lastTransactionsExpensives}`,
            },
            total: {
                amount: total.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                }),
                lastTransaction: totalInterval ,
            }
        })
        setIsLoading(false)
    }

    useEffect(() => {
        loadTransactions()
    }, [])

    useFocusEffect(useCallback(() => {
        loadTransactions()
    }, []))

    return (
        <Container>
            {
                isLoading ?
                    <LoadingContainer>
                        <ActivityIndicator
                            color={theme.colors.primary}
                            size='large'
                        />
                    </LoadingContainer>

                    :

                    <>
                        <Header>
                            <UserWrapper>
                                <UserInfo>
                                    <Photo
                                        source={{ uri: 'http://github.com/damarisdwayne.png' }}
                                    />
                                    <User>
                                        <UserGreeting>Ol??, </UserGreeting>
                                        <UserName>D??maris</UserName>
                                    </User>
                                </UserInfo>
                                <IconPower name='power' />
                            </UserWrapper>
                        </Header>

                        <HighLightCards>
                            <HighLightCard
                                type='up'
                                title='Entradas'
                                amount={highlightData.entries.amount}
                                lastTransaction={highlightData.entries.lastTransaction}
                            />
                            <HighLightCard
                                type='down'
                                title='Sa??das'
                                amount={highlightData.expensives.amount}
                                lastTransaction={highlightData.expensives.lastTransaction}
                            />
                            <HighLightCard
                                type='total'
                                title='Total'
                                amount={highlightData.total.amount}
                                lastTransaction={highlightData.total.lastTransaction}
                            />
                        </HighLightCards>

                        <Transactions>
                            <Title>Listagem</Title>

                            <TransctionsList
                                data={transactions}
                                keyExtractor={item => item.id}
                                renderItem={({ item }) => <TransactionCard data={item} />}
                            />


                        </Transactions>
                    </>
            }
        </Container>
    )
}