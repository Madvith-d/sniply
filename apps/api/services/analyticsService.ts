import { prisma } from "../lib/prisma";

export async function getSummary(linkId: string) {
  const [total, unique, bots] = await Promise.all([
    prisma.click.count({
      where: { linkId },
    }),

    prisma.click.count({
      where: {
        linkId,
        isUnique: true,
      },
    }),

    prisma.click.count({
      where: {
        linkId,
        isBot: true,
      },
    }),
  ]);

  return {
    total,
    unique,
    bots,
    humans: total - bots,
  };
}

export async function getBreakdown(
  linkId: string,
  by: "device" | "browser" | "os" | "country" | "city",
) {
  const rows = await prisma.click.groupBy({
    by: [by],

    where: {
      linkId,
      isBot: false,
    },

    _count: {
      id: true,
    },

    orderBy: {
      _count: {
        id: "desc",
      },
    },

    take: 10,
  });

  const total = rows.reduce((sum, row) => sum + row._count.id, 0);

  return rows.map((row) => ({
    label: row[by]?.trim() || "Unknown",

    count: row._count.id,

    percentage: total > 0 ? Math.round((row._count.id / total) * 100) : 0,
  }));
}

export async function getTimeSeries(
  linkId: string,
  granularity: "hour" | "day" | "week" = "hour",
  last?: number,
) {
  const defaultWindow = {
    hour: 24,
    day: 30,
    week: 12,
  };

  const effectiveLast = last ?? defaultWindow[granularity];

  let startDate = new Date();

  switch (granularity) {
    case "hour":
      startDate.setHours(startDate.getHours() - effectiveLast);
      break;

    case "day":
      startDate.setDate(startDate.getDate() - effectiveLast);
      break;

    case "week":
      startDate.setDate(startDate.getDate() - effectiveLast * 7);
      break;
  }

  const clicks = await prisma.click.findMany({
    where: {
      linkId,
      isBot: false,

      createdAt: {
        gte: startDate,
      },
    },

    select: {
      createdAt: true,
    },

    orderBy: {
      createdAt: "asc",
    },
  });

  const grouped = new Map<string, number>();

  for (const click of clicks) {
    const date = click.createdAt;

    let bucket: string;

    switch (granularity) {
      case "hour":
        bucket = `${date.getUTCFullYear()}-${String(
          date.getUTCMonth() + 1,
        ).padStart(2, "0")}-${String(date.getUTCDate()).padStart(
          2,
          "0",
        )} ${String(date.getUTCHours()).padStart(2, "0")}:00`;
        break;

      case "day":
        bucket = `${date.getUTCFullYear()}-${String(
          date.getUTCMonth() + 1,
        ).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
        break;

      case "week": {
        const weekStart = new Date(date);

        const day = weekStart.getUTCDay();

        const diff = day === 0 ? -6 : 1 - day;

        weekStart.setUTCDate(weekStart.getUTCDate() + diff);

        bucket = `${weekStart.getUTCFullYear()}-${String(
          weekStart.getUTCMonth() + 1,
        ).padStart(2, "0")}-${String(weekStart.getUTCDate()).padStart(2, "0")}`;

        break;
      }
    }

    grouped.set(bucket, (grouped.get(bucket) ?? 0) + 1);
  }

  // Generate every expected bucket in the window and fill gaps with 0
  const result: { period: string; clicks: number }[] = [];
  const cursor = new Date(startDate);
  const now = new Date();

  switch (granularity) {
    case "hour": {
      cursor.setUTCMinutes(0, 0, 0);
      while (cursor <= now) {
        const bucket = `${cursor.getUTCFullYear()}-${String(cursor.getUTCMonth() + 1).padStart(2, "0")}-${String(cursor.getUTCDate()).padStart(2, "0")} ${String(cursor.getUTCHours()).padStart(2, "0")}:00`;
        result.push({ period: bucket, clicks: grouped.get(bucket) ?? 0 });
        cursor.setUTCHours(cursor.getUTCHours() + 1);
      }
      break;
    }
    case "day": {
      cursor.setUTCHours(0, 0, 0, 0);
      while (cursor <= now) {
        const bucket = `${cursor.getUTCFullYear()}-${String(cursor.getUTCMonth() + 1).padStart(2, "0")}-${String(cursor.getUTCDate()).padStart(2, "0")}`;
        result.push({ period: bucket, clicks: grouped.get(bucket) ?? 0 });
        cursor.setUTCDate(cursor.getUTCDate() + 1);
      }
      break;
    }
    case "week": {
      const dayOfWeek = cursor.getUTCDay();
      const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      cursor.setUTCDate(cursor.getUTCDate() + diff);
      cursor.setUTCHours(0, 0, 0, 0);
      while (cursor <= now) {
        const bucket = `${cursor.getUTCFullYear()}-${String(cursor.getUTCMonth() + 1).padStart(2, "0")}-${String(cursor.getUTCDate()).padStart(2, "0")}`;
        result.push({ period: bucket, clicks: grouped.get(bucket) ?? 0 });
        cursor.setUTCDate(cursor.getUTCDate() + 7);
      }
      break;
    }
  }

  return result;
}
