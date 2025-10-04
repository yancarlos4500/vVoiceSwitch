namespace RossCarlson.Vatsim.vERAM.UI.Controls
{
	partial class VSCSRadioPanel
	{
		/// <summary> 
		/// Required designer variable.
		/// </summary>
		private System.ComponentModel.IContainer components = null;

		/// <summary> 
		/// Clean up any resources being used.
		/// </summary>
		/// <param name="disposing">true if managed resources should be disposed; otherwise, false.</param>
		protected override void Dispose(bool disposing)
		{
			if (disposing && (components != null)) {
				components.Dispose();
			}
			base.Dispose(disposing);
		}

		#region Component Designer generated code

		/// <summary> 
		/// Required method for Designer support - do not modify 
		/// the contents of this method with the code editor.
		/// </summary>
		private void InitializeComponent()
		{
			this.lblFreq = new RossCarlson.Vatsim.vERAM.UI.Controls.VSCSLabel();
			this.btnOutputSelect = new RossCarlson.Vatsim.vERAM.UI.Controls.VSCSOutputSelector();
			this.btnRX = new RossCarlson.Vatsim.vERAM.UI.Controls.VSCSButton();
			this.btnTX = new RossCarlson.Vatsim.vERAM.UI.Controls.VSCSButton();
			this.SuspendLayout();
			// 
			// lblFreq
			// 
			this.lblFreq.Anchor = ((System.Windows.Forms.AnchorStyles)(((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Left) 
            | System.Windows.Forms.AnchorStyles.Right)));
			this.lblFreq.BackColor = System.Drawing.Color.FromArgb(((int)(((byte)(74)))), ((int)(((byte)(214)))), ((int)(((byte)(222)))));
			this.lblFreq.BracketThickness = 1;
			this.lblFreq.BracketWidth = 50;
			this.lblFreq.Font = new System.Drawing.Font("VSCS", 9.75F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
			this.lblFreq.ForeColor = System.Drawing.Color.Black;
			this.lblFreq.Location = new System.Drawing.Point(0, 0);
			this.lblFreq.Margin = new System.Windows.Forms.Padding(4);
			this.lblFreq.Name = "lblFreq";
			this.lblFreq.Size = new System.Drawing.Size(192, 12);
			this.lblFreq.TabIndex = 4;
			this.lblFreq.Text = "132.075";
			this.lblFreq.Visible = false;
			// 
			// btnOutputSelect
			// 
			this.btnOutputSelect.AlternateBackgroundColor = RossCarlson.Vatsim.vERAM.UI.Controls.VSCSColor.Green;
			this.btnOutputSelect.Anchor = ((System.Windows.Forms.AnchorStyles)((System.Windows.Forms.AnchorStyles.Bottom | System.Windows.Forms.AnchorStyles.Left)));
			this.btnOutputSelect.BackColor = System.Drawing.Color.FromArgb(((int)(((byte)(180)))), ((int)(((byte)(180)))), ((int)(((byte)(180)))));
			this.btnOutputSelect.FlashBackground = false;
			this.btnOutputSelect.Font = new System.Drawing.Font("VSCS", 9.75F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
			this.btnOutputSelect.ForeColor = System.Drawing.Color.Black;
			this.btnOutputSelect.Function = RossCarlson.Vatsim.vERAM.UI.Controls.VSCSButtonFunction.NoOp;
			this.btnOutputSelect.IndicatorState = RossCarlson.Vatsim.vERAM.UI.Controls.VSCSIndicatorState.Off;
			this.btnOutputSelect.Location = new System.Drawing.Point(68, 12);
			this.btnOutputSelect.Margin = new System.Windows.Forms.Padding(4);
			this.btnOutputSelect.Name = "btnOutputSelect";
			this.btnOutputSelect.NonLatching = false;
			this.btnOutputSelect.Output = RossCarlson.Vatsim.Voice.AudioOutput.None;
			this.btnOutputSelect.Size = new System.Drawing.Size(56, 68);
			this.btnOutputSelect.TabIndex = 3;
			this.btnOutputSelect.TriState = false;
			this.btnOutputSelect.Visible = false;
			this.btnOutputSelect.MouseClick += new System.Windows.Forms.MouseEventHandler(this.BtnOutputSelect_MouseClick);
			// 
			// btnRX
			// 
			this.btnRX.AlternateBackgroundColor = RossCarlson.Vatsim.vERAM.UI.Controls.VSCSColor.Green;
			this.btnRX.Anchor = ((System.Windows.Forms.AnchorStyles)((System.Windows.Forms.AnchorStyles.Bottom | System.Windows.Forms.AnchorStyles.Left)));
			this.btnRX.BackColor = System.Drawing.Color.FromArgb(((int)(((byte)(180)))), ((int)(((byte)(180)))), ((int)(((byte)(180)))));
			this.btnRX.FlashBackground = false;
			this.btnRX.Font = new System.Drawing.Font("VSCS", 9.75F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
			this.btnRX.ForeColor = System.Drawing.Color.Black;
			this.btnRX.Function = RossCarlson.Vatsim.vERAM.UI.Controls.VSCSButtonFunction.NoOp;
			this.btnRX.IndicatorState = RossCarlson.Vatsim.vERAM.UI.Controls.VSCSIndicatorState.Off;
			this.btnRX.Location = new System.Drawing.Point(136, 12);
			this.btnRX.Margin = new System.Windows.Forms.Padding(4);
			this.btnRX.Name = "btnRX";
			this.btnRX.NonLatching = false;
			this.btnRX.Size = new System.Drawing.Size(56, 68);
			this.btnRX.TabIndex = 2;
			this.btnRX.Text = " RCVR\r\n  ON";
			this.btnRX.Visible = false;
			this.btnRX.MouseClick += new System.Windows.Forms.MouseEventHandler(this.BtnRX_MouseClick);
			// 
			// btnTX
			// 
			this.btnTX.AlternateBackgroundColor = RossCarlson.Vatsim.vERAM.UI.Controls.VSCSColor.Green;
			this.btnTX.Anchor = ((System.Windows.Forms.AnchorStyles)((System.Windows.Forms.AnchorStyles.Bottom | System.Windows.Forms.AnchorStyles.Left)));
			this.btnTX.BackColor = System.Drawing.Color.FromArgb(((int)(((byte)(180)))), ((int)(((byte)(180)))), ((int)(((byte)(180)))));
			this.btnTX.FlashBackground = false;
			this.btnTX.Font = new System.Drawing.Font("VSCS", 9.75F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
			this.btnTX.ForeColor = System.Drawing.Color.Black;
			this.btnTX.Function = RossCarlson.Vatsim.vERAM.UI.Controls.VSCSButtonFunction.NoOp;
			this.btnTX.IndicatorState = RossCarlson.Vatsim.vERAM.UI.Controls.VSCSIndicatorState.Off;
			this.btnTX.Location = new System.Drawing.Point(0, 12);
			this.btnTX.Margin = new System.Windows.Forms.Padding(4);
			this.btnTX.Name = "btnTX";
			this.btnTX.NonLatching = false;
			this.btnTX.Size = new System.Drawing.Size(56, 68);
			this.btnTX.TabIndex = 0;
			this.btnTX.Text = " XMTR\r\n  OFF";
			this.btnTX.Visible = false;
			this.btnTX.MouseClick += new System.Windows.Forms.MouseEventHandler(this.BtnTX_MouseClick);
			// 
			// VSCSRadioPanel
			// 
			this.AutoScaleDimensions = new System.Drawing.SizeF(9F, 17F);
			this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
			this.BackColor = System.Drawing.Color.FromArgb(((int)(((byte)(180)))), ((int)(((byte)(180)))), ((int)(((byte)(180)))));
			this.Controls.Add(this.lblFreq);
			this.Controls.Add(this.btnOutputSelect);
			this.Controls.Add(this.btnRX);
			this.Controls.Add(this.btnTX);
			this.Font = new System.Drawing.Font("VSCS", 11.25F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
			this.ForeColor = System.Drawing.Color.FromArgb(((int)(((byte)(92)))), ((int)(((byte)(92)))), ((int)(((byte)(92)))));
			this.Margin = new System.Windows.Forms.Padding(4);
			this.Name = "VSCSRadioPanel";
			this.Size = new System.Drawing.Size(192, 80);
			this.ResumeLayout(false);

		}

		#endregion

		private VSCSButton btnTX;
		private VSCSButton btnRX;
		private VSCSOutputSelector btnOutputSelect;
		private VSCSLabel lblFreq;
	}
}
