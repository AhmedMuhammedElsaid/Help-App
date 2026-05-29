'use client';

import type React from 'react';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { createClient } from '@/lib/supabase/client';
import type { Case, CaseStatus } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CaseFormProps {
  userId: string;
  initialCase?: Case;
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/(^-|-$)/g, '');
}

export function CaseForm({ userId, initialCase }: CaseFormProps) {
  const t = useTranslations();
  const router = useRouter();
  const isEdit = Boolean(initialCase);

  const [isLoading, setIsLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: initialCase?.title ?? '',
    slug: initialCase?.slug ?? '',
    payment_link: initialCase?.payment_link ?? '',
    description: initialCase?.description ?? '',
    imageUrl: initialCase?.image_url ?? '',
    goalAmount: initialCase?.goal_amount?.toString() ?? '',
    currentAmount: initialCase?.current_amount?.toString() ?? '',
    status: (initialCase?.status ?? 'active') as CaseStatus,
  });

  const uploadImage = async (file: File) => {
    try {
      setUploadingImage(true);
      setError(null);

      const supabase = createClient();

      const fileExt = file.name.split('.').pop();

      const fileName = `${crypto.randomUUID()}.${fileExt}`;

      const filePath = `campaigns/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('case-thumbnails')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const {
        data: { publicUrl },
      } = supabase.storage
        .from('case-thumbnails')
        .getPublicUrl(filePath);

      setFormData((prev) => ({
        ...prev,
        imageUrl: publicUrl,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : t('Common.uploadFailed'));
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);
    setError(null);

    const supabase = createClient();

    const payload = {
      title: formData.title,
      slug: formData.slug,
      payment_link: formData.payment_link,
      description: formData.description || null,
      image_url: formData.imageUrl || null,
      goal_amount: formData.goalAmount
        ? Number(formData.goalAmount)
        : null,
      current_amount: formData.currentAmount
        ? Number(formData.currentAmount)
        : null,
      currency: t('CaseForm.currency'),
      status: formData.status,
    };

    try {
      if (isEdit && initialCase) {
        const { error: updateError } = await supabase
          .from('campaigns')
          .update(payload)
          .eq('id', initialCase.id);

        if (updateError) {
          throw updateError;
        }
      } else {
        const { error: insertError } = await supabase
          .from('campaigns')
          .insert({
            ...payload,
            created_by: userId,
          });

        if (insertError) {
          throw insertError;
        }
      }

      router.push('/admin');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('Common.unknownError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isEdit
            ? t('CaseForm.editTitle')
            : t('CaseForm.newTitle')}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="title">
              {t('CaseForm.header')} *
            </Label>

            <Input
              id="title"
              placeholder={t('CaseForm.headerPlaceholder')}
              value={formData.title}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  title: e.target.value,
                  slug: isEdit
                    ? formData.slug
                    : slugify(e.target.value),
                })
              }
              required
            />
          </div>

          <div className="space-y-2 hidden">
            <Label htmlFor="slug">
              {t('CaseForm.slug')} *
            </Label>

            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  slug: e.target.value,
                })
              }
              required
              readOnly
            />

            <p className="text-xs text-muted-foreground">
              {t('CaseForm.slugHint')}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">
              {t('CaseForm.description')} *
            </Label>

            <Textarea
              id="description"
              rows={6}
              placeholder={t('CaseForm.descriptionPlaceholder')}
              value={formData.description}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  description: e.target.value,
                })
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="whatsappNumber">
              {t('CaseForm.whatsappNumber')} *
            </Label>

            <Input
              id="whatsappNumber"
              type="tel"
              inputMode="numeric"
              placeholder={t('CaseForm.whatsappNumberPlaceholder')}
              value={formData.payment_link}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  payment_link: e.target.value,
                })
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="imageUrl">
              {t('CaseForm.thumbnail')}
            </Label>

            <Input
              id="imageUrl"
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files?.[0];

                if (!file) return;

                await uploadImage(file);
              }}
            />

            <p className="text-xs text-muted-foreground">
              {t('CaseForm.thumbnailHint')}
            </p>

            {uploadingImage && (
              <p className="text-sm text-muted-foreground">
                {t('Common.uploadingImage')}
              </p>
            )}

            {formData.imageUrl && (
              <img
                src={formData.imageUrl}
                alt={t('Common.imagePreviewAlt')}
                className="h-40 w-full rounded-md border object-cover"
              />
            )}
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="goalAmount">
                {t('CaseForm.goalAmount')}
              </Label>
              <Input
                id="goalAmount"
                type="number"
                min="0"
                step="0.01"
                placeholder={t('CaseForm.goalPlaceholder')}
                value={formData.goalAmount}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    goalAmount: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currentAmount">
                {t('CaseForm.currentAmount')}
              </Label>
              <Input
                id="currentAmount"
                type="number"
                min="0"
                step="0.01"
                placeholder={t('CaseForm.currentAmountPlaceholder')}
                value={formData.currentAmount}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    currentAmount: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">
                {t('CaseForm.status')}
              </Label>

              <Select
                value={formData.status}
                onValueChange={(v) =>
                  setFormData({
                    ...formData,
                    status: v as CaseStatus,
                  })
                }
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="active">
                    {t('CaseForm.statusActive')}
                  </SelectItem>

                  <SelectItem value="paused">
                    {t('CaseForm.statusPaused')}
                  </SelectItem>

                  <SelectItem value="completed">
                    {t('CaseForm.statusCompleted')}
                  </SelectItem>

                  <SelectItem value="archived">
                    {t('CaseForm.statusArchived')}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {error && (
            <p className="text-sm text-destructive">
              {error}
            </p>
          )}

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => router.back()}
            >
              {t('Common.cancel')}
            </Button>

            <Button
              type="submit"
              className="flex-1"
              disabled={isLoading || uploadingImage}
            >
              {isLoading
                ? t('Common.saving')
                : isEdit
                  ? t('CaseForm.updateButton')
                  : t('CaseForm.createButton')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
