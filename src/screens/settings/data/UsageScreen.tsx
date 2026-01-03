import { useFocusEffect } from '@react-navigation/native'
import { FlashList } from '@shopify/flash-list'
import { Button } from 'heroui-native'
import React, { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'

import { Container, HeaderBar, SafeAreaContainer, Text, YStack } from '@/componentsV2'
import { UsageService, type ModelUsageStat } from '@/services/UsageService'

export default function UsageScreen() {
  const { t } = useTranslation()
  const [stats, setStats] = useState<ModelUsageStat[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchStats = useCallback(async () => {
    setIsLoading(true)
    const data = await UsageService.getUsageStats()
    setStats(data)
    setIsLoading(false)
  }, [])

  useFocusEffect(
    useCallback(() => {
      fetchStats()
    }, [fetchStats])
  )

  const renderItem = ({ item }: { item: ModelUsageStat }) => {
    return (
      <View className="flex-row items-center justify-between border-b border-neutral-200 py-4 dark:border-neutral-800">
        <YStack className="flex-1 gap-1">
          <Text className="text-base font-medium">{item.modelId}</Text>
          <Text className="text-sm text-neutral-500">
            {t('common.messages', { count: item.messageCount, defaultValue: `${item.messageCount} messages` })}
          </Text>
        </YStack>
        <YStack className="items-end gap-1">
          <Text className="text-base font-bold text-primary">
            {item.totalTokens.toLocaleString()}
          </Text>
          <Text className="text-xs text-neutral-400">Tokens</Text>
          {item.totalCost > 0 && (
             <Text className="text-xs text-green-600">
               ${item.totalCost.toFixed(4)}
             </Text>
          )}
        </YStack>
      </View>
    )
  }

  return (
    <SafeAreaContainer>
      <HeaderBar title={t('settings.data.usage.title', { defaultValue: 'Token Usage' })} />
      <Container className="flex-1 pb-0">
        <View className="mb-4 rounded-lg bg-primary/10 p-4">
          <Text className="text-center text-sm text-primary">
            {t('settings.data.usage.description', {
                defaultValue: 'This page shows approximate token usage tracked locally on your device.'
            })}
          </Text>
        </View>

        <FlashList
          data={stats}
          renderItem={renderItem}
          keyExtractor={item => item.modelId}
          ListEmptyComponent={
            !isLoading ? (
              <View className="mt-10 items-center justify-center">
                <Text className="text-neutral-400">
                    {t('settings.data.usage.empty', { defaultValue: 'No usage data found yet.' })}
                </Text>
              </View>
            ) : null
          }
        />
      </Container>
    </SafeAreaContainer>
  )
}
