import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';

import '../core/theme/app_colors.dart';
import '../data/mock_data.dart';
import '../widgets/app_toast.dart';
import '../widgets/top_app_bar.dart';

/// History screen — summary cards, search, filter tabs, citation list.
/// Mirrors `src/components/police/screens/history-screen.tsx`.
class HistoryScreen extends ConsumerStatefulWidget {
  const HistoryScreen({super.key});

  @override
  ConsumerState<HistoryScreen> createState() => _HistoryScreenState();
}

class _HistoryScreenState extends ConsumerState<HistoryScreen> {
  String _filter = 'all';
  String _query = '';
  final TextEditingController _queryCtrl = TextEditingController();

  @override
  void dispose() {
    _queryCtrl.dispose();
    super.dispose();
  }

  List<Citation> get _filtered {
    return citationHistory.where((c) {
      if (_filter == 'paid' && c.status != 'Imelipwa') return false;
      if (_filter == 'unpaid' && c.status != 'Hajalipwa') return false;
      if (_query.isNotEmpty) {
        final q = _query.toLowerCase();
        return c.plate.toLowerCase().contains(q) ||
            c.driver.toLowerCase().contains(q) ||
            c.offense.toLowerCase().contains(q) ||
            c.id.toLowerCase().contains(q);
      }
      return true;
    }).toList();
  }

  int get _totalFines => citationHistory.fold<int>(
        0,
        (s, c) => s + _parseAmount(c.fine),
      );

  int get _unpaidFines => citationHistory
      .where((c) => c.status == 'Hajalipwa')
      .fold<int>(0, (s, c) => s + _parseAmount(c.fine));

  int _parseAmount(String fine) {
    final digits = fine.replaceAll(RegExp(r'[^\d]'), '');
    return int.tryParse(digits) ?? 0;
  }

  String _formatTzs(int amount) {
    final s = amount.toString();
    final buf = StringBuffer();
    for (var i = 0; i < s.length; i++) {
      if (i > 0 && (s.length - i) % 3 == 0) buf.write(',');
      buf.write(s[i]);
    }
    return buf.toString();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final bg = isDark ? const Color(0xFF0B1018) : AppColors.grayLight;
    final unpaidCount =
        citationHistory.where((c) => c.status == 'Hajalipwa').length;

    return Scaffold(
      backgroundColor: bg,
      body: SafeArea(
        child: Column(
          children: [
            const TopAppBar(
              title: 'Historia ya Citation',
              subtitle: 'Citations zilizotolewa',
              showBack: true,
            ),
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // Summary cards
                    Row(
                      children: [
                        Expanded(
                          child: _SummaryCard(
                            label: 'Jumla ya Faini',
                            value: 'TZS ${_formatTzs(_totalFines)}',
                            sub: '${citationHistory.length} Citations',
                            valueColor: isDark ? Colors.white : AppColors.navy,
                            isDark: isDark,
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: _SummaryCard(
                            label: 'Haijalipwa',
                            value: 'TZS ${_formatTzs(_unpaidFines)}',
                            sub: '$unpaidCount Hajalipwa',
                            valueColor: AppColors.red,
                            isDark: isDark,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    // Search
                    Container(
                      height: 44,
                      padding: const EdgeInsets.symmetric(horizontal: 12),
                      decoration: BoxDecoration(
                        color: isDark ? const Color(0xFF151C2B) : Colors.white,
                        border: Border.all(
                          color: isDark
                              ? const Color(0xFF2A3650)
                              : AppColors.grayBorder,
                        ),
                        borderRadius: BorderRadius.circular(12),
                        boxShadow: isDark
                            ? null
                            : const [
                                BoxShadow(
                                  color: Color(0x11000000),
                                  blurRadius: 6,
                                  offset: Offset(0, 1),
                                ),
                              ],
                      ),
                      child: Row(
                        children: [
                          Icon(LucideIcons.search, size: 18, color: AppColors.gray),
                          const SizedBox(width: 8),
                          Expanded(
                            child: TextField(
                              controller: _queryCtrl,
                              style: TextStyle(
                                fontSize: 13,
                                color: isDark
                                    ? Colors.white
                                    : const Color(0xFF4B5563),
                              ),
                              decoration: InputDecoration(
                                isDense: true,
                                border: InputBorder.none,
                                contentPadding: EdgeInsets.zero,
                                hintText:
                                    'Tafuta kwa plate, dereva, au namba...',
                                hintStyle: TextStyle(
                                  fontSize: 13,
                                  color: isDark
                                      ? const Color(0xFF6B7689)
                                      : AppColors.gray,
                                ),
                              ),
                              onChanged: (v) => setState(() => _query = v),
                            ),
                          ),
                          if (_query.isNotEmpty)
                            GestureDetector(
                              onTap: () {
                                _queryCtrl.clear();
                                setState(() => _query = '');
                              },
                              child: Padding(
                                padding: const EdgeInsets.only(left: 8),
                                child: Text(
                                  'Futa',
                                  style: TextStyle(
                                    fontSize: 11,
                                    color: isDark
                                        ? const Color(0xFF8A94A6)
                                        : AppColors.gray,
                                  ),
                                ),
                              ),
                            ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 12),
                    // Filter tabs
                    Row(
                      children: [
                        Icon(LucideIcons.filter, size: 14, color: AppColors.gray),
                        const SizedBox(width: 8),
                        _FilterChip(
                          label: 'Zote',
                          active: _filter == 'all',
                          isDark: isDark,
                          onTap: () => setState(() => _filter = 'all'),
                        ),
                        const SizedBox(width: 8),
                        _FilterChip(
                          label: 'Haijalipwa',
                          active: _filter == 'unpaid',
                          isDark: isDark,
                          onTap: () => setState(() => _filter = 'unpaid'),
                        ),
                        const SizedBox(width: 8),
                        _FilterChip(
                          label: 'Imelipwa',
                          active: _filter == 'paid',
                          isDark: isDark,
                          onTap: () => setState(() => _filter = 'paid'),
                        ),
                        const Spacer(),
                        _ReportButton(
                          isDark: isDark,
                          onTap: () => showAppToast(
                            context,
                            title: 'Inapakua',
                            description: 'Ripoti ya historia inapakuliwa.',
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    // List
                    if (_filtered.isEmpty)
                      _EmptyState(isDark: isDark)
                    else
                      ..._filtered.map((c) => Padding(
                            padding: const EdgeInsets.only(bottom: 10),
                            child: _CitationCard(
                              citation: c,
                              isDark: isDark,
                              onTap: () => showAppToast(
                                context,
                                title: c.id,
                                description: '${c.offense} — ${c.plate}',
                              ),
                            ),
                          )),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _SummaryCard extends StatelessWidget {
  const _SummaryCard({
    required this.label,
    required this.value,
    required this.sub,
    required this.valueColor,
    required this.isDark,
  });

  final String label;
  final String value;
  final String sub;
  final Color valueColor;
  final bool isDark;

  @override
  Widget build(BuildContext context) {
    final cardColor = isDark ? const Color(0xFF151C2B) : Colors.white;
    final labelColor = isDark ? const Color(0xFF8A94A6) : AppColors.gray;
    final subColor = isDark ? const Color(0xFF8A94A6) : AppColors.gray;

    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: cardColor,
        borderRadius: BorderRadius.circular(16),
        boxShadow: isDark
            ? null
            : const [
                BoxShadow(
                  color: Color(0x11000000),
                  blurRadius: 6,
                  offset: Offset(0, 1),
                ),
              ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: TextStyle(fontSize: 10, color: labelColor),
          ),
          const SizedBox(height: 4),
          Text(
            value,
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w700,
              color: valueColor,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            sub,
            style: TextStyle(fontSize: 10, color: subColor),
          ),
        ],
      ),
    );
  }
}

class _FilterChip extends StatelessWidget {
  const _FilterChip({
    required this.label,
    required this.active,
    required this.isDark,
    required this.onTap,
  });

  final String label;
  final bool active;
  final bool isDark;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final activeColor = AppColors.navy;
    final inactiveColor =
        isDark ? const Color(0xFF151C2B) : Colors.white;
    final inactiveText =
        isDark ? const Color(0xFF8A94A6) : AppColors.grayText;

    return Material(
      color: active ? activeColor : inactiveColor,
      borderRadius: BorderRadius.circular(8),
      child: InkWell(
        borderRadius: BorderRadius.circular(8),
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
          child: Text(
            label,
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: active ? Colors.white : inactiveText,
            ),
          ),
        ),
      ),
    );
  }
}

class _ReportButton extends StatelessWidget {
  const _ReportButton({required this.isDark, required this.onTap});

  final bool isDark;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final cardColor = isDark ? const Color(0xFF151C2B) : Colors.white;
    final labelColor = isDark ? Colors.white : AppColors.navy;

    return Material(
      color: cardColor,
      borderRadius: BorderRadius.circular(8),
      child: InkWell(
        borderRadius: BorderRadius.circular(8),
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(LucideIcons.download, size: 13, color: labelColor),
              const SizedBox(width: 4),
              Text(
                'Ripoti',
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w500,
                  color: labelColor,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _CitationCard extends StatelessWidget {
  const _CitationCard({
    required this.citation,
    required this.isDark,
    required this.onTap,
  });

  final Citation citation;
  final bool isDark;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final cardColor = isDark ? const Color(0xFF151C2B) : Colors.white;
    final nameColor = isDark ? Colors.white : const Color(0xFF1F2937);
    final driverColor = isDark ? const Color(0xFF8A94A6) : AppColors.grayText;
    final metaColor = isDark ? const Color(0xFF8A94A6) : AppColors.gray;
    final fineColor = isDark ? Colors.white : AppColors.navy;
    final chevColor = isDark ? const Color(0xFF6B7689) : AppColors.gray;

    return Material(
      color: cardColor,
      borderRadius: BorderRadius.circular(16),
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.all(12),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 44,
                height: 44,
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  color: AppColors.tint(citation.statusColor, isDark ? 0.22 : 0.12),
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  LucideIcons.fileText,
                  size: 20,
                  color: AppColors.fromHex(citation.statusColor),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: AppColors.yellowSoft,
                            border: Border.all(color: AppColors.navy),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            citation.plate,
                            style: const TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w700,
                              color: AppColors.navy,
                            ),
                          ),
                        ),
                        const SizedBox(width: 6),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                          decoration: BoxDecoration(
                            color: AppColors.fromHex(citation.statusColor),
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Text(
                            citation.status,
                            style: const TextStyle(
                              fontSize: 9,
                              fontWeight: FontWeight.w700,
                              color: Colors.white,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      citation.offense,
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                        color: nameColor,
                      ),
                    ),
                    Text(
                      citation.driver,
                      style: TextStyle(fontSize: 11, color: driverColor),
                    ),
                    Text(
                      '${citation.date} • ${citation.time} • ${citation.location}',
                      style: TextStyle(fontSize: 10, color: metaColor),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      citation.fine,
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                        color: fineColor,
                      ),
                    ),
                  ],
                ),
              ),
              Icon(LucideIcons.chevronRight, size: 18, color: chevColor),
            ],
          ),
        ),
      ),
    );
  }
}

class _EmptyState extends StatelessWidget {
  const _EmptyState({required this.isDark});

  final bool isDark;

  @override
  Widget build(BuildContext context) {
    final cardColor = isDark ? const Color(0xFF151C2B) : Colors.white;
    final subtleColor = isDark ? const Color(0xFF6B7689) : AppColors.gray;

    return Container(
      padding: const EdgeInsets.symmetric(vertical: 40),
      decoration: BoxDecoration(
        color: cardColor,
        borderRadius: BorderRadius.circular(16),
        boxShadow: isDark
            ? null
            : const [
                BoxShadow(
                  color: Color(0x11000000),
                  blurRadius: 6,
                  offset: Offset(0, 1),
                ),
              ],
      ),
      child: Column(
        children: [
          Icon(LucideIcons.fileText, size: 32, color: subtleColor),
          const SizedBox(height: 8),
          Text(
            'Hakuna citation iliyopatikana',
            style: TextStyle(fontSize: 13, color: subtleColor),
          ),
        ],
      ),
    );
  }
}
