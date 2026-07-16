import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';

import '../core/constants/app_constants.dart';
import '../core/theme/app_colors.dart';
import '../providers/auth_provider.dart';
import '../widgets/police_logo.dart';

/// OTP login flow: credentials → otp → success → /home.
///
/// Mirrors `src/components/police/screens/login-screen.tsx`.
class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  _LoginStep _step = _LoginStep.credentials;
  AuthMethod _method = AuthMethod.username;
  final TextEditingController _identifierCtrl = TextEditingController();
  final List<TextEditingController> _otpCtrls =
      List.generate(AppConstants.otpLength, (_) => TextEditingController());
  final List<FocusNode> _otpFocus =
      List.generate(AppConstants.otpLength, (_) => FocusNode());

  bool _sending = false;
  int _resendTimer = 0;
  Timer? _resendTicker;

  @override
  void dispose() {
    _identifierCtrl.dispose();
    for (final c in _otpCtrls) {
      c.dispose();
    }
    for (final f in _otpFocus) {
      f.dispose();
    }
    _resendTicker?.cancel();
    super.dispose();
  }

  void _startResendTimer() {
    _resendTimer = AppConstants.otpResendSeconds;
    _resendTicker?.cancel();
    _resendTicker = Timer.periodic(const Duration(seconds: 1), (t) {
      if (!mounted) {
        t.cancel();
        return;
      }
      setState(() {
        _resendTimer -= 1;
        if (_resendTimer <= 0) t.cancel();
      });
    });
  }

  Future<void> _sendOtp() async {
    final id = _identifierCtrl.text.trim();
    if (id.isEmpty) return;
    setState(() => _sending = true);
    await Future.delayed(const Duration(milliseconds: 1200));
    if (!mounted) return;
    setState(() {
      _sending = false;
      _step = _LoginStep.otp;
    });
    _startResendTimer();
    FocusScope.of(context).requestFocus(_otpFocus.first);
  }

  Future<void> _verifyOtp() async {
    final code = _otpCtrls.map((c) => c.text).join();
    if (code.length < AppConstants.otpLength) return;
    setState(() => _step = _LoginStep.success);
    await Future.delayed(const Duration(milliseconds: 1100));
    if (!mounted) return;
    await ref.read(authProvider.notifier).login(
          identifier: _identifierCtrl.text.trim(),
          method: _method,
        );
    if (!mounted) return;
    context.goNamed('home');
  }

  void _resendOtp() {
    if (_resendTimer > 0) return;
    _startResendTimer();
  }

  bool get _otpComplete =>
      _otpCtrls.every((c) => c.text.trim().isNotEmpty);

  String get _maskedIdentifier {
    final s = _identifierCtrl.text.trim();
    if (_method == AuthMethod.phone && s.length >= 5) {
      return '${s.substring(0, 3)}•••••${s.substring(s.length - 2)}';
    }
    return s;
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? const Color(0xFF0B1018) : Colors.white,
      body: SafeArea(
        child: Stack(
          children: [
            // Decorative bottom cityscape (very subtle).
            Positioned(
              left: 0,
              right: 0,
              bottom: 0,
              child: _Cityscape(isDark: isDark),
            ),
            SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  const SizedBox(height: 8),
                  PoliceLogo(
                    size: 112,
                    ringColor: AppColors.bluePrimary.withValues(alpha: 0.2),
                    ringWidth: 4,
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'TANZANIA POLICE FORCE',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.w800,
                      letterSpacing: -0.3,
                      color: isDark ? Colors.white : AppColors.navyDeep,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    AppConstants.tagline,
                    style: const TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w500,
                      color: AppColors.bluePrimary,
                    ),
                  ),
                  const SizedBox(height: 28),
                  _buildCard(isDark),
                  const SizedBox(height: 24),
                  Text(
                    'Mfumo salama wa Jeshi la Polisi Tanzania',
                    style: TextStyle(
                      fontSize: 11,
                      color: isDark ? const Color(0xFF8A94A6) : AppColors.grayText,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '© 2026 Tanzania Police Force',
                    style: TextStyle(
                      fontSize: 11,
                      color: isDark ? const Color(0xFF6B7689) : AppColors.gray,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCard(bool isDark) {
    final cardColor = isDark ? const Color(0xFF151C2B) : Colors.white;
    final borderColor = isDark ? const Color(0xFF2A3650) : const Color(0xFFF1F3F6);

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: cardColor,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: borderColor),
        boxShadow: const [
          BoxShadow(
            color: Color(0x14000000),
            blurRadius: 20,
            offset: Offset(0, 4),
          ),
        ],
      ),
      child: AnimatedSwitcher(
        duration: const Duration(milliseconds: 220),
        child: _step == _LoginStep.credentials
            ? _credentialsStep(isDark)
            : _step == _LoginStep.otp
                ? _otpStep(isDark)
                : _successStep(isDark),
      ),
    );
  }

  Widget _credentialsStep(bool isDark) {
    final textColor = isDark ? Colors.white : AppColors.navyDeep;
    final mutedColor = isDark ? const Color(0xFF8A94A6) : AppColors.grayText;
    final segmentedBg = isDark ? const Color(0xFF1A2336) : const Color(0xFFF3F4F6);
    final chipBg = isDark ? const Color(0xFF1A2336) : Colors.white;
    final fieldBorder =
        isDark ? const Color(0xFF2A3650) : AppColors.grayBorder;
    final fieldBg = isDark ? const Color(0xFF0F1626) : Colors.white;

    return Column(
      key: const ValueKey('credentials'),
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(
          'Officer Login',
          textAlign: TextAlign.center,
          style: TextStyle(
            fontSize: 19,
            fontWeight: FontWeight.w700,
            color: textColor,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          'Ingia kutumia akaunti yako ya utumishi',
          textAlign: TextAlign.center,
          style: TextStyle(fontSize: 13, color: mutedColor),
        ),
        const SizedBox(height: 16),
        // Method toggle (segmented control)
        Container(
          padding: const EdgeInsets.all(4),
          decoration: BoxDecoration(
            color: segmentedBg,
            borderRadius: BorderRadius.circular(12),
          ),
          child: Row(
            children: [
              Expanded(
                child: _segmentButton(
                  active: _method == AuthMethod.username,
                  label: 'Username',
                  icon: LucideIcons.user,
                  isDark: isDark,
                  chipBg: chipBg,
                  onTap: () => setState(() => _method = AuthMethod.username),
                ),
              ),
              Expanded(
                child: _segmentButton(
                  active: _method == AuthMethod.phone,
                  label: 'Mobile Number',
                  icon: LucideIcons.phone,
                  isDark: isDark,
                  chipBg: chipBg,
                  onTap: () => setState(() => _method = AuthMethod.phone),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),
        // Identifier input
        Align(
          alignment: Alignment.centerLeft,
          child: Text(
            _method == AuthMethod.username ? 'Username' : 'Namba ya Simu',
            style: TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w500,
              color: textColor,
            ),
          ),
        ),
        const SizedBox(height: 6),
        Container(
          decoration: BoxDecoration(
            color: fieldBg,
            border: Border.all(color: fieldBorder),
            borderRadius: BorderRadius.circular(12),
          ),
          padding: const EdgeInsets.symmetric(horizontal: 12),
          child: Row(
            children: [
              Icon(
                _method == AuthMethod.username
                    ? LucideIcons.user
                    : LucideIcons.phone,
                size: 20,
                color: AppColors.bluePrimary,
              ),
              const SizedBox(width: 8),
              Expanded(
                child: TextField(
                  controller: _identifierCtrl,
                  keyboardType: _method == AuthMethod.phone
                      ? TextInputType.phone
                      : TextInputType.text,
                  inputFormatters: _method == AuthMethod.phone
                      ? [FilteringTextInputFormatter.digitsOnly]
                      : null,
                  textInputAction: TextInputAction.go,
                  onSubmitted: (_) => _sendOtp(),
                  style: TextStyle(
                    fontSize: 14,
                    color: isDark ? Colors.white : const Color(0xFF1F2937),
                  ),
                  decoration: InputDecoration(
                    isDense: true,
                    contentPadding: const EdgeInsets.symmetric(vertical: 14),
                    border: InputBorder.none,
                    hintText: _method == AuthMethod.username
                        ? 'Ingiza username yako'
                        : 'Ingiza namba ya simu (07XX XXX XXX)',
                    hintStyle: TextStyle(
                      fontSize: 14,
                      color: isDark ? const Color(0xFF6B7689) : AppColors.gray,
                    ),
                  ),
                  onChanged: (_) => setState(() {}),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 12),
        // Info note
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
          decoration: BoxDecoration(
            color: AppColors.bluePrimary.withValues(alpha: 0.06),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Icon(
                LucideIcons.smartphone,
                size: 16,
                color: AppColors.bluePrimary,
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Text.rich(
                  TextSpan(
                    style: TextStyle(
                      fontSize: 11,
                      height: 1.35,
                      color: isDark ? const Color(0xFFB4BCC9) : const Color(0xFF6B7280),
                    ),
                    children: [
                      const TextSpan(text: 'OTP itatumwa kwa simu yako baada ya kuwasilisha. '),
                      TextSpan(
                        text: 'Hakuna password inahitajika.',
                        style: TextStyle(
                          fontWeight: FontWeight.w600,
                          color: AppColors.bluePrimary,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 20),
        // Send OTP button
        _PrimaryButton(
          label: 'Tuma OTP',
          icon: LucideIcons.keyRound,
          trailingIcon: LucideIcons.arrowRight,
          loading: _sending,
          loadingLabel: 'Inatuma OTP...',
          enabled: _identifierCtrl.text.trim().isNotEmpty && !_sending,
          onPressed: _sendOtp,
        ),
      ],
    );
  }

  Widget _segmentButton({
    required bool active,
    required String label,
    required IconData icon,
    required bool isDark,
    required Color chipBg,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        padding: const EdgeInsets.symmetric(vertical: 8),
        decoration: BoxDecoration(
          color: active ? chipBg : Colors.transparent,
          borderRadius: BorderRadius.circular(10),
          boxShadow: active
              ? const [
                  BoxShadow(
                    color: Color(0x14000000),
                    blurRadius: 4,
                    offset: Offset(0, 1),
                  ),
                ]
              : null,
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              icon,
              size: 14,
              color: active
                  ? AppColors.bluePrimary
                  : (isDark ? const Color(0xFF8A94A6) : AppColors.grayText),
            ),
            const SizedBox(width: 6),
            Text(
              label,
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: active
                    ? AppColors.bluePrimary
                    : (isDark ? const Color(0xFF8A94A6) : AppColors.grayText),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _otpStep(bool isDark) {
    final textColor = isDark ? Colors.white : AppColors.navyDeep;
    final mutedColor = isDark ? const Color(0xFF8A94A6) : AppColors.grayText;

    return Column(
      key: const ValueKey('otp'),
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        GestureDetector(
          onTap: () {
            setState(() {
              _step = _LoginStep.credentials;
              for (final c in _otpCtrls) {
                c.clear();
              }
            });
          },
          child: Row(
            children: [
              Icon(
                LucideIcons.arrowLeft,
                size: 16,
                color: mutedColor,
              ),
              const SizedBox(width: 4),
              Text(
                'Rudi',
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w500,
                  color: mutedColor,
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 12),
        Text(
          'Thibitisha OTP',
          textAlign: TextAlign.center,
          style: TextStyle(
            fontSize: 19,
            fontWeight: FontWeight.w700,
            color: textColor,
          ),
        ),
        const SizedBox(height: 4),
        Text.rich(
          TextSpan(
            style: TextStyle(fontSize: 13, color: mutedColor),
            children: [
              const TextSpan(text: 'Tumekutumia OTP yenye tarakimu 6 kwa '),
              TextSpan(
                text: _maskedIdentifier,
                style: TextStyle(
                  fontWeight: FontWeight.w600,
                  color: textColor,
                ),
              ),
            ],
          ),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 20),
        // OTP boxes
        Row(
          children: List.generate(AppConstants.otpLength, (i) {
            return Expanded(
              child: Padding(
                padding: EdgeInsets.only(
                  right: i == AppConstants.otpLength - 1 ? 0 : 8,
                ),
                child: _OtpBox(
                  controller: _otpCtrls[i],
                  focusNode: _otpFocus[i],
                  isDark: isDark,
                  onChanged: (val) {
                    setState(() {});
                    if (val.length == 1 && i < AppConstants.otpLength - 1) {
                      FocusScope.of(context).requestFocus(_otpFocus[i + 1]);
                    }
                    if (val.length == AppConstants.otpLength &&
                        i == AppConstants.otpLength - 1) {
                      // paste all
                    }
                  },
                  onBackspaceEmpty: () {
                    if (i > 0) {
                      FocusScope.of(context).requestFocus(_otpFocus[i - 1]);
                    }
                  },
                  onPaste: (text) {
                    final digits =
                        text.replaceAll(RegExp(r'\D'), '').substring(0, AppConstants.otpLength);
                    if (digits.isEmpty) return;
                    for (var j = 0; j < digits.length; j++) {
                      _otpCtrls[j].text = digits[j];
                    }
                    setState(() {});
                    final next =
                        digits.length < AppConstants.otpLength ? digits.length : AppConstants.otpLength - 1;
                    FocusScope.of(context).requestFocus(_otpFocus[next]);
                  },
                ),
              ),
            );
          }),
        ),
        const SizedBox(height: 16),
        // Resend
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              'Hujapata OTP?',
              style: TextStyle(fontSize: 12, color: mutedColor),
            ),
            const SizedBox(width: 6),
            if (_resendTimer > 0)
              Text(
                'Tuma tena baada ya ${_resendTimer}s',
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w500,
                  color: isDark ? const Color(0xFF6B7689) : AppColors.gray,
                ),
              )
            else
              GestureDetector(
                onTap: _resendOtp,
                child: Row(
                  children: [
                    Icon(
                      LucideIcons.refreshCw,
                      size: 12,
                      color: AppColors.bluePrimary,
                    ),
                    const SizedBox(width: 4),
                    Text(
                      'Tuma tena',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                        color: AppColors.bluePrimary,
                      ),
                    ),
                  ],
                ),
              ),
          ],
        ),
        const SizedBox(height: 16),
        _PrimaryButton(
          label: 'Thibitisha na Ingia',
          icon: LucideIcons.shieldCheck,
          trailingIcon: LucideIcons.arrowRight,
          enabled: _otpComplete,
          onPressed: _verifyOtp,
        ),
      ],
    );
  }

  Widget _successStep(bool isDark) {
    final textColor = isDark ? Colors.white : AppColors.navyDeep;
    final mutedColor = isDark ? const Color(0xFF8A94A6) : AppColors.grayText;

    return Column(
      key: const ValueKey('success'),
      children: [
        const SizedBox(height: 24),
        Container(
          width: 80,
          height: 80,
          alignment: Alignment.center,
          decoration: const BoxDecoration(
            color: Color(0xFFE8F5E9),
            shape: BoxShape.circle,
          ),
          child: const Icon(
            LucideIcons.checkCircle2,
            size: 48,
            color: AppColors.green,
          ),
        ),
        const SizedBox(height: 16),
        Text(
          'Login Imefanikiwa!',
          style: TextStyle(
            fontSize: 19,
            fontWeight: FontWeight.w700,
            color: textColor,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          'Karibu kwenye mfumo. Inaingia...',
          textAlign: TextAlign.center,
          style: TextStyle(fontSize: 13, color: mutedColor),
        ),
        const SizedBox(height: 16),
        Container(
          width: 128,
          height: 4,
          decoration: BoxDecoration(
            color: isDark ? const Color(0xFF1A2336) : const Color(0xFFF3F4F6),
            borderRadius: BorderRadius.circular(2),
          ),
          child: LinearProgressIndicator(
            backgroundColor: Colors.transparent,
            valueColor: AlwaysStoppedAnimation(AppColors.bluePrimary),
          ),
        ),
        const SizedBox(height: 24),
      ],
    );
  }
}

enum _LoginStep { credentials, otp, success }

class _PrimaryButton extends StatelessWidget {
  const _PrimaryButton({
    required this.label,
    required this.icon,
    this.trailingIcon,
    this.loading = false,
    this.loadingLabel,
    required this.enabled,
    required this.onPressed,
  });

  final String label;
  final IconData icon;
  final IconData? trailingIcon;
  final bool loading;
  final String? loadingLabel;
  final bool enabled;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    return Opacity(
      opacity: enabled ? 1 : 0.5,
      child: Material(
        color: AppColors.bluePrimary,
        borderRadius: BorderRadius.circular(12),
        child: InkWell(
          borderRadius: BorderRadius.circular(12),
          onTap: enabled ? onPressed : null,
          child: Container(
            padding: const EdgeInsets.symmetric(vertical: 14),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                if (loading)
                  const SizedBox(
                    width: 18,
                    height: 18,
                    child: CircularProgressIndicator(
                      strokeWidth: 2.2,
                      valueColor: AlwaysStoppedAnimation(Colors.white),
                    ),
                  )
                else
                  Icon(icon, size: 20, color: Colors.white),
                const SizedBox(width: 8),
                Text(
                  loading ? (loadingLabel ?? label) : label,
                  style: const TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w700,
                    color: Colors.white,
                  ),
                ),
                if (!loading && trailingIcon != null) ...[
                  const SizedBox(width: 8),
                  Icon(trailingIcon, size: 18, color: Colors.white),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _OtpBox extends StatefulWidget {
  const _OtpBox({
    required this.controller,
    required this.focusNode,
    required this.isDark,
    required this.onChanged,
    required this.onBackspaceEmpty,
    required this.onPaste,
  });

  final TextEditingController controller;
  final FocusNode focusNode;
  final bool isDark;
  final ValueChanged<String> onChanged;
  final VoidCallback onBackspaceEmpty;
  final ValueChanged<String> onPaste;

  @override
  State<_OtpBox> createState() => _OtpBoxState();
}

class _OtpBoxState extends State<_OtpBox> {
  @override
  void initState() {
    super.initState();
    widget.controller.addListener(_listener);
  }

  void _listener() => setState(() {});

  @override
  void dispose() {
    widget.controller.removeListener(_listener);
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final filled = widget.controller.text.isNotEmpty;
    final border = filled
        ? AppColors.bluePrimary
        : (widget.isDark ? const Color(0xFF2A3650) : AppColors.grayBorder);
    final bg = filled
        ? AppColors.bluePrimary.withValues(alpha: 0.05)
        : (widget.isDark ? const Color(0xFF0F1626) : Colors.white);

    return Focus(
      onKeyEvent: (node, event) {
        if (event is KeyDownEvent &&
            event.logicalKey == LogicalKeyboardKey.backspace &&
            widget.controller.text.isEmpty) {
          widget.onBackspaceEmpty();
        }
        return KeyEventResult.ignored;
      },
      child: Container(
        height: 48,
        decoration: BoxDecoration(
          color: bg,
          border: Border.all(color: border, width: 2),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Center(
          child: TextField(
            controller: widget.controller,
            focusNode: widget.focusNode,
            keyboardType: TextInputType.number,
            textAlign: TextAlign.center,
            maxLength: 1,
            inputFormatters: [FilteringTextInputFormatter.digitsOnly],
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.w700,
              color: widget.isDark ? Colors.white : AppColors.navyDeep,
            ),
            decoration: const InputDecoration(
              counterText: '',
              border: InputBorder.none,
              contentPadding: EdgeInsets.zero,
            ),
            onChanged: (val) {
              if (val.length > 1) {
                // paste — delegate
                widget.controller.text = '';
                widget.onPaste(val);
                return;
              }
              widget.onChanged(val);
            },
          ),
        ),
      ),
    );
  }
}

class _Cityscape extends StatelessWidget {
  const _Cityscape({required this.isDark});

  final bool isDark;

  @override
  Widget build(BuildContext context) {
    final navy = isDark ? const Color(0xFF0F1626) : AppColors.navy;
    return IgnorePointer(
      child: Opacity(
        opacity: 0.06,
        child: SizedBox(
          height: 180,
          width: double.infinity,
          child: Stack(
            children: [
              Align(
                alignment: Alignment.bottomCenter,
                child: Container(
                  height: 100,
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.bottomCenter,
                      end: Alignment.topCenter,
                      colors: [AppColors.blue, Colors.transparent],
                    ),
                  ),
                ),
              ),
              Align(
                alignment: Alignment.bottomCenter,
                child: CustomPaint(
                  size: const Size(double.infinity, 180),
                  painter: _SkylinePainter(color: navy),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _SkylinePainter extends CustomPainter {
  _SkylinePainter({required this.color});

  final Color color;

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()..color = color;
    final w = size.width;
    final h = size.height;
    final path = Path()..moveTo(0, h);
    // Approximate the PWA's polygon points, scaled to width.
    final pts = <Offset>[
      Offset(0, h * 0.6),
      Offset(w * 0.075, h * 0.6),
      Offset(w * 0.075, h * 0.45),
      Offset(w * 0.15, h * 0.45),
      Offset(w * 0.15, h * 0.55),
      Offset(w * 0.225, h * 0.55),
      Offset(w * 0.225, h * 0.35),
      Offset(w * 0.30, h * 0.35),
      Offset(w * 0.30, h * 0.50),
      Offset(w * 0.375, h * 0.50),
      Offset(w * 0.375, h * 0.30),
      Offset(w * 0.45, h * 0.30),
      Offset(w * 0.45, h * 0.475),
      Offset(w * 0.525, h * 0.475),
      Offset(w * 0.525, h * 0.40),
      Offset(w * 0.60, h * 0.40),
      Offset(w * 0.60, h * 0.25),
      Offset(w * 0.675, h * 0.25),
      Offset(w * 0.675, h * 0.45),
      Offset(w * 0.75, h * 0.45),
      Offset(w * 0.75, h * 0.375),
      Offset(w * 0.825, h * 0.375),
      Offset(w * 0.825, h * 0.525),
      Offset(w * 0.90, h * 0.525),
      Offset(w * 0.90, h * 0.425),
      Offset(w, h * 0.425),
      Offset(w, h),
    ];
    path.addPolygon(pts, false);
    path.close();
    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
